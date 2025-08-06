// 夜航时间计算页面
// 工具管理器将在需要时动态引入
const SunCalc = require('../../utils/suncalc.js')

Page({
  data: {
    // 功能选择 - 固定为夜航时间计算
    calculationType: 'nightflight', // 固定为夜航时间计算

    // 日期范围设置
    minDate: new Date(2020, 0, 1).getTime(), // 从2020年1月1日开始
    maxDate: new Date(2050, 11, 31).getTime(), // 到2050年结束
    useBeijingTime: true,  // 默认使用北京时间

    // 夜航计算相关
    departureIcaoCode: '',
    arrivalIcaoCode: '',
    departureAirportInfo: null,
    arrivalAirportInfo: null,
    departureTime: new Date(),
    arrivalTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 默认比出发时间晚2小时
    departureTimeStr: '',
    arrivalTimeStr: '',
    nightFlightResults: null,
    airportDataLoaded: false,
    
    // 夜航选择器状态
    showDepartureCoordinatePicker: false,
    showArrivalCoordinatePicker: false,
    showDepartureTimePicker: false,
    showArrivalTimePicker: false,
    selectedDepartureCoordinate: [0, 31, 0, 121],  // 上海坐标N31E121
    selectedArrivalCoordinate: [0, 31, 0, 121],    // 上海坐标N31E121
    
    // 夜航模式需要的坐标选择器数据 - Vant标准格式
    coordinateColumns: [
      // 第一列：纬度方向
      {
        values: ['N', 'S'],
        defaultIndex: 0
      },
      // 第二列：纬度度数 0-90
      {
        values: (function() {
          const arr = [];
          for (let i = 0; i <= 90; i++) {
            arr.push(i.toString());
          }
          return arr;
        })(),
        defaultIndex: 31  // 上海纬度N31
      },
      // 第三列：经度方向  
      {
        values: ['E', 'W'],
        defaultIndex: 0
      },
      // 第四列：经度度数 0-180
      {
        values: (function() {
          const arr = [];
          for (let i = 0; i <= 180; i++) {
            arr.push(i.toString());
          }
          return arr;
        })(),
        defaultIndex: 121  // 上海经度E121
      }
    ],
    


    
    // 时间戳，供datetime-picker使用
    validDepartureTimestamp: new Date().getTime(),
    validArrivalTimestamp: new Date().getTime() + 2 * 60 * 60 * 1000,


  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '夜航时间计算'
    })
    
    var now = new Date()
    var departureTime = new Date(now.getTime())
    var arrivalTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    this.setData({
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      departureTimeStr: this.formatDateTime(departureTime),
      arrivalTimeStr: this.formatDateTime(arrivalTime),
      validDepartureTimestamp: departureTime.getTime(),
      validArrivalTimestamp: arrivalTime.getTime()
    })
    
    // 加载机场数据
    this.loadAirportData()
  },

  // 加载机场数据
  loadAirportData: function() {
    var self = this
    try {
      var dataManager = require('../../utils/data-manager.js')
      dataManager.loadAirportData().then(function() {
        self.setData({
          airportDataLoaded: true
        })
      }).catch(function(error) {
        console.error('❌ 夜航页面机场数据加载失败:', error)
      })
    } catch (error) {
      console.error('❌ 夜航页面机场数据加载失败:', error)
    }
  },

  // ICAO代码输入处理
  onDepartureIcaoInput: function(event) {
    var inputValue = ''
    if (event.detail && event.detail.value) {
      inputValue = event.detail.value
    }
    
    // 保存用户原始输入，不转换大小写
    this.setData({
      departureIcaoCode: inputValue
    })

    // 使用防抖机制，避免频繁查询
    if (this.departureSearchTimer) {
      clearTimeout(this.departureSearchTimer)
    }

    // 支持ICAO代码（3-4位）、IATA代码（3位）或中文名称（1位及以上）查询
    var shouldSearch = (inputValue.length >= 3 && /^[A-Za-z]{3,4}$/.test(inputValue)) || // ICAO/IATA代码
                       (inputValue.length >= 1 && /[\u4e00-\u9fa5]/.test(inputValue))     // 包含中文字符

    if (shouldSearch && this.data.airportDataLoaded) {
      var self = this
      this.departureSearchTimer = setTimeout(function() {
        self.lookupDepartureAirport(inputValue)
      }, 300)
    } else if (!shouldSearch) {
      this.setData({
        departureAirportInfo: null
      })
    }
  },

  onArrivalIcaoInput: function(event) {
    var inputValue = ''
    if (event.detail && event.detail.value) {
      inputValue = event.detail.value
    }
    
    // 保存用户原始输入，不转换大小写
    this.setData({
      arrivalIcaoCode: inputValue
    })

    // 使用防抖机制，避免频繁查询
    if (this.arrivalSearchTimer) {
      clearTimeout(this.arrivalSearchTimer)
    }

    // 支持ICAO代码（3-4位）、IATA代码（3位）或中文名称（1位及以上）查询
    var shouldSearch = (inputValue.length >= 3 && /^[A-Za-z]{3,4}$/.test(inputValue)) || // ICAO/IATA代码
                       (inputValue.length >= 1 && /[\u4e00-\u9fa5]/.test(inputValue))     // 包含中文字符

    if (shouldSearch && this.data.airportDataLoaded) {
      var self = this
      this.arrivalSearchTimer = setTimeout(function() {
        self.lookupArrivalAirport(inputValue)
      }, 300)
    } else if (!shouldSearch) {
      this.setData({
        arrivalAirportInfo: null
      })
    }
  },

  // 查找出发机场
  lookupDepartureAirport: function(query) {
    var airports = this.findAirportsByQuery(query)
    
    if (airports.length === 0) {
      this.setData({
        departureAirportInfo: null
      })
    } else if (airports.length === 1) {
      this.setData({
        departureAirportInfo: airports[0]
      })
    } else {
      // 多个匹配结果，显示选择弹窗
      this.showAirportSelectionDialog(airports, 'departure', query)
    }
  },

  // 查找到达机场
  lookupArrivalAirport: function(query) {
    var airports = this.findAirportsByQuery(query)
    
    if (airports.length === 0) {
      this.setData({
        arrivalAirportInfo: null
      })
    } else if (airports.length === 1) {
      this.setData({
        arrivalAirportInfo: airports[0]
      })
    } else {
      // 多个匹配结果，显示选择弹窗
      this.showAirportSelectionDialog(airports, 'arrival', query)
    }
  },

  // 清除出发机场输入
  clearDepartureInput: function() {
    this.setData({
      departureIcaoCode: '',
      departureAirportInfo: null
    })
  },

  // 清除到达机场输入
  clearArrivalInput: function() {
    this.setData({
      arrivalIcaoCode: '',
      arrivalAirportInfo: null
    })
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
        matchType: item.matchType,
        priority: item.priority
      }))

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
            longitude: item.Longitude
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
            longitude: item.Longitude
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
              longitude: item.Longitude
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
                longitude: item.Longitude
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

  // 显示机场选择弹窗
  showAirportSelectionDialog: function(airports, type, query) {
    if (airports.length === 0) return
    
    
    var actionItems = []
    for (var i = 0; i < airports.length; i++) {
      var airport = airports[i]
      // 改进显示格式：中文名 + ICAO + IATA（如果有的话）
      var displayName = airport.name
      if (airport.icaoCode) {
        displayName += ' (' + airport.icaoCode
        if (airport.iataCode) {
          displayName += '/' + airport.iataCode
        }
        displayName += ')'
      }
      actionItems.push({
        name: displayName,
        value: i
      })
    }
    
    var itemList = actionItems.map(function(item) { return item.name })
    
    // 微信小程序ActionSheet最多支持6个选项，如果超过则截取前6个
    if (itemList.length > 6) {
      itemList = itemList.slice(0, 6)
      airports = airports.slice(0, 6)
    }
    
    var self = this
    wx.showActionSheet({
      itemList: itemList,
      success: function(res) {
        var selectedAirport = airports[res.tapIndex]
        if (type === 'departure') {
          self.setData({
            departureAirportInfo: selectedAirport
          })
        } else {
          self.setData({
            arrivalAirportInfo: selectedAirport
          })
        }
      },
      fail: function(err) {
        // 用户取消选择时给出提示
        var airportType = type === 'departure' ? '出发' : '到达'
        wx.showToast({
          title: `请选择具体的${airportType}机场`,
          icon: 'none',
          duration: 2500
        })
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

  // 获取有效的出发时间戳
  getValidDepartureTimestamp: function() {
    const time = this.data.departureTime
    if (time && time instanceof Date && !isNaN(time.getTime())) {
      const timestamp = time.getTime()
      // 确保在有效范围内
      if (timestamp >= this.data.minDate && timestamp <= this.data.maxDate) {
        return timestamp
      }
    }
    // 返回当前时间作为默认值
    return new Date().getTime()
  },

  // 获取有效的到达时间戳
  getValidArrivalTimestamp() {
    const time = this.data.arrivalTime
    if (time && time instanceof Date && !isNaN(time.getTime())) {
      const timestamp = time.getTime()
      // 确保在有效范围内
      if (timestamp >= this.data.minDate && timestamp <= this.data.maxDate) {
        return timestamp
      }
    }
    // 返回当前时间+2小时作为默认值
    return new Date().getTime() + 2 * 60 * 60 * 1000
  },



  // 切换时间制式
  toggleTimeZone() {
    const newTimeZone = !this.data.useBeijingTime
    this.setData({
      useBeijingTime: newTimeZone
    })
    

    
    // 如果有夜航计算结果，重新计算并显示
    if (this.data.nightFlightResults) {
      this.calculateNightFlightTime()
    }
    
    // 更新夜航模式的时间显示
    if (this.data.calculationType === 'nightflight') {
      if (this.data.departureTime && this.data.departureTime instanceof Date && !isNaN(this.data.departureTime.getTime())) {
        this.setData({
          departureTimeStr: this.formatDateTime(this.data.departureTime)
        })
      }
      if (this.data.arrivalTime && this.data.arrivalTime instanceof Date && !isNaN(this.data.arrivalTime.getTime())) {
        this.setData({
          arrivalTimeStr: this.formatDateTime(this.data.arrivalTime)
        })
      }
      // 更新有效时间戳
      this.updateValidTimestamps()
    }
  },



  // 格式化坐标显示
  formatCoordinateDisplay(coordinate: number[], type: 'latitude' | 'longitude' | 'both'): string {
    if (!coordinate || coordinate.length !== 4) {
      return ''
    }
    
    if (type === 'latitude') {
      // 纬度方向：N/S
      const directions = ['N', 'S']
      const direction = directions[coordinate[0]] || 'N'
      const degrees = coordinate[1]
      return `${direction}${degrees}`
    } else if (type === 'longitude') {
      // 经度方向：E/W
      const directions = ['E', 'W']
      const direction = directions[coordinate[2]] || 'E'
      const degrees = coordinate[3]
      return `${direction}${degrees}`
    } else {
      // 同时显示纬度和经度
      const latDirections = ['N', 'S']
      const lngDirections = ['E', 'W']
      const latDirection = latDirections[coordinate[0]] || 'N'
      const lngDirection = lngDirections[coordinate[2]] || 'E'
      const latDegrees = coordinate[1]
      const lngDegrees = coordinate[3]
      return `${latDirection}${latDegrees} ${lngDirection}${lngDegrees}`
    }
  },






  // 夜航模式 - 出发地坐标选择
  showDepartureCoordinatePicker() {
    this.setData({
      showDepartureCoordinatePicker: true
    })
  },

  closeDepartureCoordinatePicker() {
    this.setData({
      showDepartureCoordinatePicker: false
    })
  },

  confirmDepartureCoordinate(event: any) {
    const selectedCoordinate = event.detail.value
    this.setData({
      selectedDepartureCoordinate: selectedCoordinate,
      departureCoordinate: this.formatCoordinateDisplay(selectedCoordinate, 'both'),
      showDepartureCoordinatePicker: false
    })
  },

  // 夜航模式 - 到达地坐标选择
  showArrivalCoordinatePicker() {
    this.setData({
      showArrivalCoordinatePicker: true
    })
  },

  closeArrivalCoordinatePicker() {
    this.setData({
      showArrivalCoordinatePicker: false
    })
  },

  confirmArrivalCoordinate(event: any) {
    const selectedCoordinate = event.detail.value
    this.setData({
      selectedArrivalCoordinate: selectedCoordinate,
      arrivalCoordinate: this.formatCoordinateDisplay(selectedCoordinate, 'both'),
      showArrivalCoordinatePicker: false
    })
  },

  // 夜航模式 - 出发地时间选择
  showDepartureTimePicker() {
    // 更新有效时间戳
    this.updateValidTimestamps()
    
    this.setData({
      showDepartureTimePicker: true
    })
  },

  closeDepartureTimePicker() {
    this.setData({
      showDepartureTimePicker: false
    })
  },

  selectDepartureTime(event: any) {
    // datetime picker返回的是时间戳
    const departureTime = new Date(event.detail)
    
    
    const formattedTime = this.formatDateTime(departureTime)
    
    this.setData({
      departureTime: departureTime,
      departureTimeStr: formattedTime,
      validDepartureTimestamp: departureTime.getTime(),
      showDepartureTimePicker: false
    })
  },

  // 夜航模式 - 到达地时间选择
  showArrivalTimePicker() {
    // 确保arrivalTime是有效的时间，且在min-date和max-date范围内
    const currentTime = this.data.arrivalTime
    let validTime = currentTime
    
    if (!currentTime || !(currentTime instanceof Date) || isNaN(currentTime.getTime())) {
      validTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000) // 默认比当前时间晚2小时
    }
    
    // 对于时间选择器，不需要日期范围限制
    
    // 更新有效时间戳
    this.updateValidTimestamps()
    
    this.setData({
      showArrivalTimePicker: true
    })
  },

  closeArrivalTimePicker() {
    this.setData({
      showArrivalTimePicker: false
    })
  },

  selectArrivalTime(event: any) {
    // datetime picker返回的是时间戳
    const arrivalTime = new Date(event.detail)
    
    
    const formattedTime = this.formatDateTime(arrivalTime)
    
    this.setData({
      arrivalTime: arrivalTime,
      arrivalTimeStr: formattedTime,
      validArrivalTimestamp: arrivalTime.getTime(),
      showArrivalTimePicker: false
    })
  },

  // 夜航时间计算
  calculateNightFlightTime: function() {
    var self = this
    
    // 参数验证
    var departureTime = self.data.departureTime
    var arrivalTime = self.data.arrivalTime
    var departureAirportInfo = self.data.departureAirportInfo
    var arrivalAirportInfo = self.data.arrivalAirportInfo

    if (!departureAirportInfo || !arrivalAirportInfo) {
      wx.showToast({
        title: '请输入出发和到达机场ICAO代码',
        icon: 'none'
      });
      return;
    }

    if (!departureTime || !arrivalTime) {
      wx.showToast({
        title: '请选择出发和到达时间',
        icon: 'none'
      });
      return;
    }

    if (arrivalTime <= departureTime) {
      wx.showToast({
        title: '到达时间必须晚于出发时间',
        icon: 'none'
      });
      return;
    }

    // 直接执行计算（不再扣费）
    self.performNightFlightCalculation()
  },

  // 分离出来的实际夜航时间计算逻辑
  performNightFlightCalculation: function() {
    var departureTime = this.data.departureTime
    var arrivalTime = this.data.arrivalTime
    var departureAirportInfo = this.data.departureAirportInfo
    var arrivalAirportInfo = this.data.arrivalAirportInfo

    try {
      // 从机场信息中获取坐标
      var departureCoord = {
        lat: departureAirportInfo.latitude,
        lng: departureAirportInfo.longitude
      }
      var arrivalCoord = {
        lat: arrivalAirportInfo.latitude,
        lng: arrivalAirportInfo.longitude
      }

      // 计算出发地和到达地的日出日落时间
      const departureTimes = SunCalc.getTimes(departureTime, departureCoord.lat, departureCoord.lng)
      const arrivalTimes = SunCalc.getTimes(arrivalTime, arrivalCoord.lat, arrivalCoord.lng)

      // 为夜航计算添加坐标信息
      departureTimes.lat = departureCoord.lat
      departureTimes.lng = departureCoord.lng
      arrivalTimes.lat = arrivalCoord.lat
      arrivalTimes.lng = arrivalCoord.lng

      // 计算夜间飞行时间和详细信息
      const nightFlightDetails = this.calculateNightTimeDetailed(departureTime, arrivalTime, departureTimes, arrivalTimes)
      const totalFlightTime = arrivalTime.getTime() - departureTime.getTime()
      const nightPercentage = ((nightFlightDetails.totalNightTime / totalFlightTime) * 100).toFixed(1)

      const results = {
        totalFlightTime: this.formatDuration(totalFlightTime),
        nightFlightTime: this.formatDuration(nightFlightDetails.totalNightTime),
        nightFlightPercentage: nightPercentage + '%',
        departureSunset: this.formatTime(departureTimes.sunset),
        departureSunrise: this.formatTime(departureTimes.sunrise),
        arrivalSunset: this.formatTime(arrivalTimes.sunset),
        arrivalSunrise: this.formatTime(arrivalTimes.sunrise),
        // 新增：夜航进入和退出时间
        nightEntryTime: nightFlightDetails.entryTime ? this.formatDateTime(nightFlightDetails.entryTime) : '无',
        nightExitTime: nightFlightDetails.exitTime ? this.formatDateTime(nightFlightDetails.exitTime) : '无'
      }

      this.setData({
        nightFlightResults: results
      })

      wx.showToast({
        title: '计算完成',
        icon: 'success'
      })

    } catch (error) {
      console.error('夜航时间计算错误：', error)
      wx.showToast({
        title: '计算失败，请检查输入',
        icon: 'none'
      })
    }
  },

  // 辅助方法
  parseCoordinateFromArray(coordinate: number[]) {
    const [latDirIndex, latDegrees, lngDirIndex, lngDegrees] = coordinate
    const latDirections = ['N', 'S']
    const lngDirections = ['E', 'W']
    const latDirection = latDirections[latDirIndex]
    const lngDirection = lngDirections[lngDirIndex]
    
    const lat = latDirection === 'N' ? latDegrees : -latDegrees
    const lng = lngDirection === 'E' ? lngDegrees : -lngDegrees

    return { lat, lng }
  },

  // 精确的夜航时间计算：5分钟间隔插值，沿途判断夜间
  calculateNightTimeDetailed(departureTime: Date, arrivalTime: Date, departureTimes: any, arrivalTimes: any) {
    
    const departureTimeMs = departureTime.getTime()
    const arrivalTimeMs = arrivalTime.getTime()
    const flightDurationMs = arrivalTimeMs - departureTimeMs
    
    // 出发地和到达地坐标
    const depLat = departureTimes.lat
    const depLng = departureTimes.lng
    const arrLat = arrivalTimes.lat  
    const arrLng = arrivalTimes.lng
    
    
    // 5分钟 = 300000毫秒
    const intervalMs = 5 * 60 * 1000
    let totalNightTime = 0
    let nightEntryTime = null
    let nightExitTime = null
    let inNightPeriod = false
    
    // 如果飞行时间少于5分钟，直接检查中点
    if (flightDurationMs <= intervalMs) {
      const midTime = new Date((departureTimeMs + arrivalTimeMs) / 2)
      const midLat = (depLat + arrLat) / 2
      const midLng = (depLng + arrLng) / 2
      const midSunTimes = SunCalc.getTimes(midTime, midLat, midLng)
      
      if (this.isNightTime(midTime, midSunTimes)) {
        totalNightTime = flightDurationMs
        nightEntryTime = departureTime
        nightExitTime = arrivalTime
      } else {
      }
    } else {
      // 长途飞行：5分钟间隔精确计算
      const numIntervals = Math.ceil(flightDurationMs / intervalMs)
      
      for (let i = 0; i <= numIntervals; i++) {
        const currentTimeMs = Math.min(departureTimeMs + i * intervalMs, arrivalTimeMs)
        const currentTime = new Date(currentTimeMs)
        
        // 计算当前时间点的飞行进度 (0-1)
        const progress = (currentTimeMs - departureTimeMs) / flightDurationMs
        
        // 线性插值计算当前位置的经纬度
        const currentLat = depLat + (arrLat - depLat) * progress
        const currentLng = depLng + (arrLng - depLng) * progress
        
        // 计算当前位置的日出日落时间
        const currentSunTimes = SunCalc.getTimes(currentTime, currentLat, currentLng)
        // 将经纬度信息添加到sunTimes对象中
        currentSunTimes.lat = currentLat
        currentSunTimes.lng = currentLng
        const isCurrentNight = this.isNightTime(currentTime, currentSunTimes)
        
        
        if (isCurrentNight && !inNightPeriod) {
          // 进入夜间
          nightEntryTime = currentTime
          inNightPeriod = true
                 } else if (!isCurrentNight && inNightPeriod && nightEntryTime) {
           // 退出夜间
           nightExitTime = currentTime
           const nightSegmentTime = currentTimeMs - nightEntryTime.getTime()
           totalNightTime += nightSegmentTime
           inNightPeriod = false
         }
         
         // 如果到达最后一个时间点且仍在夜间
         if (i === numIntervals && inNightPeriod && nightEntryTime) {
           nightExitTime = arrivalTime
           const nightSegmentTime = arrivalTimeMs - nightEntryTime.getTime()
           totalNightTime += nightSegmentTime
         }
      }
    }
    
    
    return {
      totalNightTime: Math.max(0, totalNightTime),
      entryTime: nightEntryTime,
      exitTime: nightExitTime,
      periods: []
    }
  },
  
  calculateNightTime(departureTime: Date, arrivalTime: Date, departureTimes: any, arrivalTimes: any): number {
    /**
     * 跨时区夜航时间计算算法说明：
     * 
     * 1. 基本原理：
     *    - 夜间飞行定义：按照中国民航局规定，日落后1小时至日出前1小时之间的时间段
     *    - 跨时区飞行需要考虑沿途不同位置的日出日落时间变化
     * 
     * 2. 计算方法：
     *    - 短途飞行（<30分钟）：简化判断出发时是否为夜间
     *    - 长途飞行：分段计算，每15分钟一段
     *    - 每段使用线性插值估算中点位置
     *    - 计算中点位置的当地日出日落时间
     *    - 判断该时间段是否为夜间（日落后1小时至日出前1小时）
     * 
     * 3. 示例：
     *    - 从北京(UTC+8)飞往伦敦(UTC+0)
     *    - 出发：20:00 北京时间（日落后1小时前，非夜间）
     *    - 出发：21:00 北京时间（日落后1小时后，夜间）
     *    - 飞行过程中经过的每个位置都会计算当地的日出日落时间+1小时偏移
     */
    
    // 改进的夜航时间计算算法
    // 基于中国民航规章，夜间飞行时间的定义是日落后1小时至日出前1小时之间的时间段
    
    let nightTime = 0
    const flightDuration = arrivalTime.getTime() - departureTime.getTime()
    
    // 如果飞行时间很短（小于30分钟），简化处理
    if (flightDuration < 30 * 60 * 1000) {
      // 检查出发时间是否在夜间
      if (this.isNightTime(departureTime, departureTimes)) {
        return flightDuration
      } else {
        return 0
      }
    }
    
    // 对于较长的飞行，分段计算夜间时间
    // 将飞行过程分为多个时间段，每段检查是否为夜间
    const segments = Math.ceil(flightDuration / (15 * 60 * 1000)) // 每15分钟一段
    const segmentDuration = flightDuration / segments
    
    for (let i = 0; i < segments; i++) {
      const segmentStartTime = new Date(departureTime.getTime() + i * segmentDuration)
      const segmentEndTime = new Date(departureTime.getTime() + (i + 1) * segmentDuration)
      const segmentMidTime = new Date((segmentStartTime.getTime() + segmentEndTime.getTime()) / 2)
      
      // 根据航段中点的位置计算当地日出日落时间
      // 这里简化处理，使用线性插值估算中点位置的日出日落时间
      const progress = i / segments
      const midLatitude = this.interpolateCoordinate(departureTimes.lat, arrivalTimes.lat, progress)
      const midLongitude = this.interpolateCoordinate(departureTimes.lng, arrivalTimes.lng, progress)
      
      // 计算中点位置的日出日落时间
      const midTimes = SunCalc.getTimes(segmentMidTime, midLatitude, midLongitude)
      
      // 检查这个时间段是否为夜间
      if (this.isNightTime(segmentMidTime, midTimes)) {
        nightTime += segmentDuration
      }
    }
    
    return Math.max(0, nightTime)
  },

  // 判断给定时间是否为夜间：按照中国民航局规定"日落后1小时至日出前1小时"
  isNightTime(time: Date, sunTimes: any): boolean {
    const currentTime = time.getTime()
    const sunrise = sunTimes.sunrise.getTime()
    const sunset = sunTimes.sunset.getTime()
    
    const oneHour = 60 * 60 * 1000  // 1小时的毫秒数
    
    // 🔥 简化的夜间判断逻辑：
    // 夜间时间段：从日落后1小时开始，到日出前1小时结束
    const nightStart = sunset + oneHour     // 日落后1小时
    const nightEnd = sunrise - oneHour      // 日出前1小时
    
    let isNight = false
    
    // 判断是否在夜间时段
    // 如果夜间时间段跨午夜（nightStart > nightEnd），则分两段判断
    if (nightStart > nightEnd) {
      // 跨午夜情况：当前时间在日落后1小时之后 OR 在日出前1小时之前
      isNight = (currentTime >= nightStart) || (currentTime <= nightEnd)
    } else {
      // 同一天情况（极地地区可能出现）：当前时间在两个时间点之间
      isNight = (currentTime >= nightStart) && (currentTime <= nightEnd)
    }
    
    // 简化的调试信息
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    
    
    return isNight
  },

  // 坐标线性插值
  interpolateCoordinate(start: number, end: number, progress: number): number {
    return start + (end - start) * progress
  },

  formatDateTime(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '无效时间'
    }

    const year = date.getFullYear()
    const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1)
    const day = (date.getDate() < 10 ? '0' : '') + date.getDate()
    let hours: number, minutes: number
    
    if (this.data.useBeijingTime) {
      // 北京时间显示 - 直接使用本地时间
      hours = date.getHours()
      minutes = date.getMinutes()
    } else {
      // UTC时间显示 - 直接使用本地时间，不进行时区转换
      // 因为datetime-picker选择的时间就是用户想要的UTC时间
      hours = date.getHours()
      minutes = date.getMinutes()
    }
    
    const timeZoneIndicator = this.data.useBeijingTime ? ' (北京时)' : ' (UTC)'
    const hourStr = hours < 10 ? '0' + hours : hours.toString()
    const minuteStr = minutes < 10 ? '0' + minutes : minutes.toString()
    return `${year}-${month}-${day} ${hourStr}:${minuteStr}${timeZoneIndicator}`
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

  formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}小时${minutes}分钟`
  },

  // 更新有效的时间戳
  updateValidTimestamps() {
    this.setData({
      validDepartureTimestamp: this.getValidDepartureTimestamp(),
      validArrivalTimestamp: this.getValidArrivalTimestamp()
    })
  },

}) 