// 日出日落时间计算页面
const SunCalcOnly = require('../../utils/suncalc.js')

Page({
  data: {
    // ICAO机场代码输入
    icaoCode: '',  // 默认为空，让用户输入
    
    // 日期选择
    selectedDate: new Date(),
    selectedDateStr: '',
    showCalendar: false,
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date(2050, 11, 31).getTime(),
    
    // 计算结果和时间制式
    sunResults: null,
    useBeijingTime: true,
    
    // 机场信息
    airportInfo: null,
    airportDataLoaded: false,

    // 🎯 基于Context7最佳实践：广告相关数据
    showSunriseBottomAd: false,
    sunriseBottomAdUnitId: '',
  },

  onLoad: function() {
    // 🎯 进入页面时扣减积分 - 日出日落查询 1积分
    const pointsManager = require('../../utils/points-manager.js');
    
    pointsManager.consumePointsForButton('sun-times-calc', '日出日落时间查询', () => {
      // 积分扣减成功后初始化页面
      // 🎯 基于Context7最佳实践：初始化广告
      this.initAd();

      // 获取当前时间
      var now = new Date()
      
      this.setData({
        selectedDate: now,
        selectedDateStr: this.formatDate(now),
      })
      
      // 加载机场数据
      this.loadAirportData()
    });
  },

  // 加载机场数据
  loadAirportData: function() {
    var self = this
    try {
      // 使用数据管理器加载机场数据
      var dataManager = require('../../utils/data-manager.js')
      dataManager.loadAirportData().then(function() {
        self.setData({
          airportDataLoaded: true
        })
        console.log('✅ 机场数据加载完成')
      }).catch(function(error) {
        console.error('❌ 机场数据加载失败:', error)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
    } catch (error) {
      console.error('❌ 机场数据加载失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  },

  // ICAO代码输入处理
  onIcaoInput: function(event) {
    // 安全检查，避免undefined错误
    var inputValue = ''
    if (event.detail && event.detail.value) {
      inputValue = event.detail.value
    }
    
    // 保存用户原始输入，不转换大小写
    this.setData({
      icaoCode: inputValue
    })

    // 使用防抖机制，避免频繁查询
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }

    // 支持ICAO代码（3-4位）、IATA代码（3位）或中文名称（1位及以上）查询
    var shouldSearch = (inputValue.length >= 3 && /^[A-Za-z]{3,4}$/.test(inputValue)) || // ICAO/IATA代码
                       (inputValue.length >= 1 && /[\u4e00-\u9fa5]/.test(inputValue))     // 包含中文字符

    if (shouldSearch && this.data.airportDataLoaded) {
      var self = this
      this.searchTimer = setTimeout(function() {
        self.lookupAirportInfo(inputValue)
      }, 300)
    } else if (!shouldSearch) {
      this.setData({
        airportInfo: null
      })
    }
  },

  // 清空ICAO输入
  clearIcaoInput: function() {
    this.setData({
      icaoCode: '',
      airportInfo: null,
      sunResults: null
    })
  },

  // 查找机场信息（仅查找，不计算）
  lookupAirportInfo: function(query) {
    var airports = this.findAirportsByQuery(query)
    
    if (airports.length === 0) {
      this.setData({
        airportInfo: null
      })
      console.log('❌ 未找到匹配的机场:', query)
    } else if (airports.length === 1) {
      this.setData({
        airportInfo: airports[0]
      })
      console.log('✅ 实时找到机场:', airports[0].name, '(' + airports[0].icaoCode + ')')
    } else {
      // 多个匹配结果，显示选择弹窗
      this.showAirportSelectionDialog(airports, query)
    }
  },

  // 查询机场并计算日出日落时间
  lookupAirportAndCalculate: function() {
    if (!this.data.icaoCode) {
      wx.showToast({
        title: '请输入机场代码或中文名',
        icon: 'none'
      })
      return
    }

    if (!this.data.airportDataLoaded) {
      wx.showToast({
        title: '机场数据加载中...',
        icon: 'loading'
      })
      return
    }

    // 查找机场信息（支持ICAO代码和中文名称）
    var airports = this.findAirportsByQuery(this.data.icaoCode)
    
    if (airports.length === 0) {
      wx.showToast({
        title: `未找到机场 ${this.data.icaoCode}`,
        icon: 'none',
        duration: 2000
      })
      this.setData({
        airportInfo: null,
        sunResults: null
      })
      return
    } else if (airports.length === 1) {
      var airportInfo = airports[0]
      console.log('✅ 找到机场:', airportInfo.name, '(' + airportInfo.icaoCode + ')')
      
      // 设置机场信息并计算
      this.setData({
        airportInfo: airportInfo
      })
      
      this.calculateSunTimes()
    } else {
      // 多个匹配结果，显示选择弹窗并在选择后自动计算
      this.showAirportSelectionDialogAndCalculate(airports, this.data.icaoCode)
    }
  },

  // 使用高性能搜索管理器查找机场
  findAirportsByQuery: function(query) {
    try {
      // 使用搜索管理器进行高性能搜索
      const { searchManager } = require('../../utils/search-manager.js')
      const dataManager = require('../../utils/data-manager.js')
      const airportData = dataManager.getCachedAirportData()
      
      if (!airportData || !Array.isArray(airportData)) {
        console.error('机场数据格式错误或未加载')
        return []
      }

      // 确保搜索索引已创建
      if (!searchManager.indexes.has('airports')) {
        console.log('🔍 创建机场搜索索引...')
        searchManager.createAirportIndex(airportData)
      }

      // 使用搜索管理器搜索
      const searchResults = searchManager.searchAirports(query, 20)
      
      // 转换搜索结果格式
      const results = searchResults.map(item => ({
        icaoCode: item.ICAOCode,
        iataCode: item.IATACode || '',
        name: item.ShortName || item.EnglishName || '',
        countryName: item.CountryName || '',
        latitude: item.Latitude,
        longitude: item.Longitude,
        coordinateDisplay: item.Latitude.toFixed(4) + '°, ' + item.Longitude.toFixed(4) + '°',
        matchType: item.matchType,
        priority: item.priority
      }))

      console.log(`🔍 机场搜索完成: "${query}" -> ${results.length}条结果`)
      return results
    } catch (error) {
      console.error('查找机场失败:', error)
      // 降级到原始搜索方法
      return this.findAirportsByQueryFallback(query)
    }
  },

  // 降级搜索方法（保持兼容性）
  findAirportsByQueryFallback: function(query) {
    try {
      var dataManager = require('../../utils/data-manager.js')
      var airportData = dataManager.getCachedAirportData()
      
      if (!airportData || !Array.isArray(airportData)) {
        console.error('机场数据格式错误或未加载')
        return []
      }

      var results = []
      var upperQuery = query.toUpperCase()
      
      // 1. 优先匹配ICAO代码（精确匹配）
      for (var i = 0; i < airportData.length; i++) {
        var item = airportData[i]
        if (item.ICAOCode && item.ICAOCode.toUpperCase() === upperQuery) {
          results.push({
            icaoCode: item.ICAOCode,
            iataCode: item.IATACode || '',
            name: item.ShortName || item.EnglishName || '',
            countryName: item.CountryName || '',
            latitude: item.Latitude,
            longitude: item.Longitude,
            coordinateDisplay: item.Latitude.toFixed(4) + '°, ' + item.Longitude.toFixed(4) + '°'
          })
          return results
        }
      }
      
      // 2. 匹配IATA代码
      for (var i = 0; i < airportData.length; i++) {
        var item = airportData[i]
        if (item.IATACode && item.IATACode.toUpperCase() === upperQuery) {
          results.push({
            icaoCode: item.ICAOCode,
            iataCode: item.IATACode || '',
            name: item.ShortName || item.EnglishName || '',
            countryName: item.CountryName || '',
            latitude: item.Latitude,
            longitude: item.Longitude,
            coordinateDisplay: item.Latitude.toFixed(4) + '°, ' + item.Longitude.toFixed(4) + '°'
          })
        }
      }
      
      // 3. 匹配中文名称（模糊匹配）
      for (var i = 0; i < airportData.length; i++) {
        var item = airportData[i]
        if (item.ShortName && item.ShortName.indexOf(query) !== -1) {
          var exists = results.some(r => r.icaoCode === item.ICAOCode)
          if (!exists) {
            results.push({
              icaoCode: item.ICAOCode,
              iataCode: item.IATACode || '',
              name: item.ShortName || item.EnglishName || '',
              countryName: item.CountryName || '',
              latitude: item.Latitude,
              longitude: item.Longitude,
              coordinateDisplay: item.Latitude.toFixed(4) + '°, ' + item.Longitude.toFixed(4) + '°'
            })
          }
        }
      }
      
      // 4. 匹配英文名称
      if (results.length < 10) {
        for (var i = 0; i < airportData.length; i++) {
          var item = airportData[i]
          if (item.EnglishName && item.EnglishName.toUpperCase().indexOf(upperQuery) !== -1) {
            var exists = results.some(r => r.icaoCode === item.ICAOCode)
            if (!exists && results.length < 20) {
              results.push({
                icaoCode: item.ICAOCode,
                iataCode: item.IATACode || '',
                name: item.ShortName || item.EnglishName || '',
                countryName: item.CountryName || '',
                latitude: item.Latitude,
                longitude: item.Longitude,
                coordinateDisplay: item.Latitude.toFixed(4) + '°, ' + item.Longitude.toFixed(4) + '°'
              })
            }
          }
        }
      }

      return results
    } catch (error) {
      console.error('降级搜索失败:', error)
      return []
    }
  },

  // 显示机场选择弹窗（实时查询用）
  showAirportSelectionDialog: function(airports, query) {
    if (airports.length === 0) return
    
    console.log(`🔍 准备显示机场选择弹窗，找到 ${airports.length} 个机场`)
    
    // 🎯 ActionSheet限制：超过6个选项可能无法显示，需要限制数量
    var displayAirports = airports.slice(0, 6)
    console.log(`🔍 限制显示前 ${displayAirports.length} 个机场以确保ActionSheet正常显示`)
    
    var actionItems = []
    for (var i = 0; i < displayAirports.length; i++) {
      var airport = displayAirports[i]
      var displayName = airport.name + ' (' + airport.icaoCode + ')'
      if (airport.iataCode) {
        displayName += '/' + airport.iataCode
      }
      actionItems.push({
        name: displayName,
        value: i
      })
      console.log(`🔍 添加选项 ${i}: ${displayName}`)
    }
    
    console.log(`🔍 调用wx.showActionSheet，选项数量: ${actionItems.length}`)
    
    var self = this
    wx.showActionSheet({
      itemList: actionItems.map(function(item) { return item.name }),
      success: function(res) {
        console.log(`✅ 用户选择了第 ${res.tapIndex} 个选项`)
        var selectedAirport = displayAirports[res.tapIndex]
        self.setData({
          airportInfo: selectedAirport
        })
        console.log('✅ 用户选择机场:', selectedAirport.name, '(' + selectedAirport.icaoCode + ')')
      },
      fail: function(err) {
        console.log('❌ ActionSheet显示失败:', err)
        console.log('用户取消选择机场')
        
        // 🎯 ActionSheet失败时的备用方案：自动选择第一个
        if (displayAirports.length > 0) {
          console.log('🎯 ActionSheet失败，自动选择第一个机场作为备用方案')
          var firstAirport = displayAirports[0]
          self.setData({
            airportInfo: firstAirport
          })
          wx.showToast({
            title: `已选择: ${firstAirport.name}`,
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },

  // 显示机场选择弹窗并在选择后自动计算
  showAirportSelectionDialogAndCalculate: function(airports, query) {
    if (airports.length === 0) return
    
    console.log(`🔍 准备显示机场选择弹窗并计算，找到 ${airports.length} 个机场`)
    
    // 🎯 ActionSheet限制：超过6个选项可能无法显示，需要限制数量
    var displayAirports = airports.slice(0, 6)
    console.log(`🔍 限制显示前 ${displayAirports.length} 个机场以确保ActionSheet正常显示`)
    
    var actionItems = []
    for (var i = 0; i < displayAirports.length; i++) {
      var airport = displayAirports[i]
      var displayName = airport.name + ' (' + airport.icaoCode + ')'
      if (airport.iataCode) {
        displayName += '/' + airport.iataCode
      }
      actionItems.push({
        name: displayName,
        value: i
      })
      console.log(`🔍 添加计算选项 ${i}: ${displayName}`)
    }
    
    console.log(`🔍 调用计算版wx.showActionSheet，选项数量: ${actionItems.length}`)
    
    var self = this
    wx.showActionSheet({
      itemList: actionItems.map(function(item) { return item.name }),
      success: function(res) {
        console.log(`✅ 用户选择了第 ${res.tapIndex} 个选项并将自动计算`)
        var selectedAirport = displayAirports[res.tapIndex]
        self.setData({
          airportInfo: selectedAirport
        })
        console.log('✅ 用户选择机场:', selectedAirport.name, '(' + selectedAirport.icaoCode + ')')
        
        // 自动计算日出日落时间
        self.calculateSunTimes()
      },
      fail: function(err) {
        console.log('❌ 计算版ActionSheet显示失败:', err)
        console.log('用户取消选择机场')
        
        // 🎯 ActionSheet失败时的备用方案：自动选择第一个并计算
        if (displayAirports.length > 0) {
          console.log('🎯 ActionSheet失败，自动选择第一个机场并计算作为备用方案')
          var firstAirport = displayAirports[0]
          self.setData({
            airportInfo: firstAirport
          })
          wx.showToast({
            title: `已选择: ${firstAirport.name}`,
            icon: 'success',
            duration: 2000
          })
          
          // 自动计算日出日落时间
          setTimeout(function() {
            self.calculateSunTimes()
          }, 500)
        }
      }
    })
  },

  // 从机场数据中查找指定ICAO代码或中文名称的机场（单个结果）
  findAirportByQuery: function(query) {
    var airports = this.findAirportsByQuery(query)
    return airports.length > 0 ? airports[0] : null
  },

  // 保持向后兼容的ICAO查找方法
  findAirportByICAO: function(icaoCode) {
    return this.findAirportByQuery(icaoCode)
  },

  // 日期选择器
  showDatePicker: function() {
    this.setData({
      showCalendar: true
    })
  },

  closeDatePicker: function() {
    this.setData({
      showCalendar: false
    })
  },

  selectDate: function(event) {
    var selectedDate = new Date(event.detail)
    this.setData({
      selectedDate: selectedDate,
      selectedDateStr: this.formatDate(selectedDate),
      showCalendar: false
    })
    
    // 如果已有机场信息，重新计算
    if (this.data.airportInfo) {
      this.calculateSunTimes()
    }
  },

  // 切换时间制式
  toggleTimeZone: function() {
    var newTimeZone = !this.data.useBeijingTime
    this.setData({
      useBeijingTime: newTimeZone
    })
    
    // 如果已有计算结果，重新计算并显示
    if (this.data.sunResults) {
      this.calculateSunTimes()
    }
  },

  // 计算日出日落时间
  calculateSunTimes: function() {
    if (!this.data.airportInfo) {
      wx.showToast({
        title: '请先输入有效的ICAO代码',
        icon: 'none'
      })
      return
    }

    this.performSunTimesCalculation()
  },

    performSunTimesCalculation: function() {
    try {
      console.log('🌅 开始计算日出日落时间')
      
      var airportInfo = this.data.airportInfo
      var selectedDate = this.data.selectedDate
      var latitude = airportInfo.latitude
      var longitude = airportInfo.longitude

      // 使用SunCalcOnly计算日出日落时间
      var times = SunCalcOnly.getTimes(selectedDate, latitude, longitude)

        // 格式化结果显示
        var results = {
          date: this.formatDate(selectedDate),
          airport: airportInfo.name + ' (' + airportInfo.icaoCode + ')',
          coordinates: airportInfo.coordinateDisplay,
          country: airportInfo.countryName,
          sunrise: this.formatTime(times.sunrise),
          sunset: this.formatTime(times.sunset)
        }

        console.log('计算结果:', results)

        this.setData({
          sunResults: results
        })

        // 显示结果后的广告
        this.showResultBottomAd()

        wx.showToast({
          title: '计算完成',
          icon: 'success'
        })

    } catch (error) {
      console.error('日出日落计算错误：', error)
      wx.showToast({
        title: '计算失败，请检查输入',
        icon: 'none'
      })
    }
  },

  // 工具方法
  formatDate: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    
    var monthStr = month < 10 ? '0' + month : month.toString()
    var dayStr = day < 10 ? '0' + day : day.toString()
    
    return year + '-' + monthStr + '-' + dayStr
  },

  formatTime: function(date) {
    if (!date || isNaN(date.getTime())) {
      return '无法计算'
    }
    
    var hours
    var minutes
    
    if (this.data.useBeijingTime) {
      // 北京时间 = UTC + 8小时
      var beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
      hours = beijingTime.getUTCHours()
      minutes = beijingTime.getUTCMinutes()
    } else {
      // UTC时间
      hours = date.getUTCHours()
      minutes = date.getUTCMinutes()
    }
    
    var hourStr = hours < 10 ? '0' + hours : hours.toString()
    var minuteStr = minutes < 10 ? '0' + minutes : minutes.toString()
    return hourStr + ':' + minuteStr
  },

  // 🎯 基于Context7最佳实践：广告相关方法
  initAd: function() {
    try {
      // 动态加载广告管理器
      var AdManager = require('../../utils/ad-manager.js')
      this.adManagerInstance = new AdManager()
      
      // 初始化结果底部广告
      this.initSunriseBottomAd()
    } catch (error) {
      console.error('🎯 广告管理器初始化失败:', error)
    }
  },

  initSunriseBottomAd: function() {
    if (this.adManagerInstance) {
      // 获取适合的广告单元
      var adUnit = this.adManagerInstance.getBestAdUnit('tool', 'primary')
      if (adUnit && adUnit.id) {
        this.setData({
          sunriseBottomAdUnitId: adUnit.id
        })
        console.log('✅ 日出日落页面广告位初始化成功:', adUnit.id)
      }
    }
  },

  showResultBottomAd: function() {
    if (this.data.sunriseBottomAdUnitId) {
      this.setData({
        showSunriseBottomAd: true
      })
    }
  },

  onSunriseBottomAdLoad: function() {
    console.log('日出日落结果底部广告加载成功')
  },

  onSunriseBottomAdError: function(err) {
    console.log('日出日落结果底部广告加载失败:', err)
  }
}) 