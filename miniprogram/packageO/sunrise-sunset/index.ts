// 夜航时间计算页面
// 引入BasePage基类，遵循项目架构规范
const BasePage = require('../../utils/base-page.js')
const SunCalc = require('../../utils/suncalc.js')

/**
 * TypeScript接口定义
 */
interface AirportInfo {
  icaoCode: string
  iataCode: string
  name: string
  countryName: string
  latitude: number
  longitude: number
  matchType?: string
  priority?: number
}

interface SunTimes {
  sunrise: Date
  sunset: Date
  lat: number
  lng: number
}

interface NightFlightResults {
  totalFlightTime: string
  nightFlightTime: string
  nightFlightPercentage: string
  departureSunset: string
  departureSunrise: string
  arrivalSunset: string
  arrivalSunrise: string
  nightEntryTime: string
  nightExitTime: string
}

interface NightFlightDetails {
  totalNightTime: number
  entryTime: Date | null
  exitTime: Date | null
  periods: any[]
}

/**
 * 配置常量
 */
const CONFIG = {
  // 时间相关常量
  DEFAULT_FLIGHT_DURATION_HOURS: 2,      // 默认飞行时长（小时）
  MILLISECONDS_PER_HOUR: 60 * 60 * 1000, // 每小时毫秒数
  MILLISECONDS_PER_MINUTE: 60 * 1000,     // 每分钟毫秒数
  NIGHT_HOUR_OFFSET: 1,                   // 夜间1小时偏移（民航规定）

  // 防抖和延迟
  DEBOUNCE_DELAY: 300,                    // 防抖延迟（毫秒）
  SCROLL_DELAY: 100,                      // 滚动延迟（毫秒）
  SCROLL_DURATION: 300,                   // 滚动动画时长（毫秒）

  // 计算精度
  CALCULATION_INTERVAL_MINUTES: 1,        // 夜航计算间隔（分钟）
  SHORT_FLIGHT_THRESHOLD_MINUTES: 30,     // 短途飞行阈值（分钟）

  // 搜索结果
  MAX_SEARCH_RESULTS: 20,                 // 最大搜索结果数
  MAX_ACTIONSHEET_ITEMS: 6,               // ActionSheet最大选项数
  MIN_SEARCH_RESULTS_BEFORE_ENGLISH: 10,  // 英文搜索前最小结果数

  // 日期范围
  DATE_RANGE_YEARS_PAST: 1,               // 过去年份范围
  DATE_RANGE_YEARS_FUTURE: 2,             // 未来年份范围

  // 吐司时长
  TOAST_DURATION: 2500,                   // 提示时长（毫秒）
} as const

// 页面配置对象
const pageConfig = {
  // ✅ 定时器类型声明
  departureSearchTimer: null as NodeJS.Timeout | null,
  arrivalSearchTimer: null as NodeJS.Timeout | null,
  autoCalculateTimer: null as NodeJS.Timeout | null, // 自动计算防抖定时器

  data: {
    // 功能选择 - 固定为夜航时间计算
    calculationType: 'nightflight', // 固定为夜航时间计算

    // 日期范围设置 - 优化为更合理的范围
    minDate: new Date(new Date().getFullYear() - CONFIG.DATE_RANGE_YEARS_PAST, 0, 1).getTime(), // 从去年1月1日开始
    maxDate: new Date(new Date().getFullYear() + CONFIG.DATE_RANGE_YEARS_FUTURE, 11, 31).getTime(), // 到后年年底
    useBeijingTime: true,  // 默认使用北京时间

    // 计算状态标志
    calculating: false, // 计算中标志，防止重复计算

    // 夜航计算相关
    departureIcaoCode: '',
    arrivalIcaoCode: '',
    departureAirportInfo: null,
    arrivalAirportInfo: null,
    departureTime: new Date(),
    arrivalTime: null, // 默认为空，需要用户手动选择
    departureTimeStr: '',
    arrivalTimeStr: '',
    nightFlightResults: null,
    airportDataLoaded: false,

    // 夜航选择器状态
    showDepartureCoordinatePicker: false,
    showArrivalCoordinatePicker: false,
    showDepartureTimePicker: false,
    showArrivalTimePicker: false,
    // 分步选择：日历+时间
    showDepartureCalendar: false,
    showDepartureTimeOnly: false,
    showArrivalCalendar: false,
    showArrivalTimeOnly: false,
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
    validArrivalTimestamp: new Date().getTime() + CONFIG.DEFAULT_FLIGHT_DURATION_HOURS * CONFIG.MILLISECONDS_PER_HOUR, // 用于picker默认显示，但不实际设置到arrivalTime
  },

  /**
   * 页面加载 - 使用customOnLoad符合BasePage规范
   */
  customOnLoad: function(): void {
    console.log('📄 夜航时间计算页面加载')

    wx.setNavigationBarTitle({
      title: '夜航时间计算'
    })

    const now = new Date()
    const departureTime = new Date(now.getTime())

    // ✅ 使用safeSetData代替直接setData，符合BasePage规范
    // 注意：arrivalTime保持为null，需要用户手动选择
    this.safeSetData({
      departureTime: departureTime,
      departureTimeStr: this.formatDateTime(departureTime),
      validDepartureTimestamp: departureTime.getTime()
    }, null, { priority: 'high' })

    // 加载机场数据
    this.loadAirportData()
  },

  /**
   * 页面销毁 - 清理定时器
   */
  customOnUnload: function(): void {
    console.log('📄 夜航页面销毁，清理搜索定时器')

    // 清理搜索定时器
    if (this.departureSearchTimer) {
      clearTimeout(this.departureSearchTimer)
      this.departureSearchTimer = null
    }
    if (this.arrivalSearchTimer) {
      clearTimeout(this.arrivalSearchTimer)
      this.arrivalSearchTimer = null
    }
    // 清理自动计算定时器
    if (this.autoCalculateTimer) {
      clearTimeout(this.autoCalculateTimer)
      this.autoCalculateTimer = null
    }
  },

  /**
   * 加载机场数据
   */
  loadAirportData: function(): void {
    const self = this
    try {
      const dataManager = require('../../utils/data-manager.js')
      dataManager.loadAirportData().then(function() {
        self.safeSetData({
          airportDataLoaded: true
        })
      }).catch(function(error: Error) {
        self.handleError(error, '夜航页面机场数据加载')
      })
    } catch (error) {
      this.handleError(error, '夜航页面机场数据加载')
    }
  },

  /**
   * 出发机场ICAO代码输入处理
   */
  onDepartureIcaoInput: function(event: any): void {
    let inputValue = ''
    if (event.detail && event.detail.value) {
      inputValue = event.detail.value
    }

    // 保存用户原始输入，不转换大小写
    this.safeSetData({
      departureIcaoCode: inputValue
    })

    // 使用防抖机制，避免频繁查询
    if (this.departureSearchTimer) {
      clearTimeout(this.departureSearchTimer)
    }

    // 支持ICAO代码（3-4位）、IATA代码（3位）或中文名称（1位及以上）查询
    const shouldSearch = (inputValue.length >= 3 && /^[A-Za-z]{3,4}$/.test(inputValue)) || // ICAO/IATA代码
                       (inputValue.length >= 1 && /[\u4e00-\u9fa5]/.test(inputValue))     // 包含中文字符

    if (shouldSearch && this.data.airportDataLoaded) {
      const self = this
      this.departureSearchTimer = setTimeout(function() {
        self.lookupDepartureAirport(inputValue)
      }, CONFIG.DEBOUNCE_DELAY)
    } else if (!shouldSearch) {
      this.safeSetData({
        departureAirportInfo: null
      })
    }
  },

  /**
   * 到达机场ICAO代码输入处理
   */
  onArrivalIcaoInput: function(event: any): void {
    let inputValue = ''
    if (event.detail && event.detail.value) {
      inputValue = event.detail.value
    }

    // 保存用户原始输入，不转换大小写
    this.safeSetData({
      arrivalIcaoCode: inputValue
    })

    // 使用防抖机制，避免频繁查询
    if (this.arrivalSearchTimer) {
      clearTimeout(this.arrivalSearchTimer)
    }

    // 支持ICAO代码（3-4位）、IATA代码（3位）或中文名称（1位及以上）查询
    const shouldSearch = (inputValue.length >= 3 && /^[A-Za-z]{3,4}$/.test(inputValue)) || // ICAO/IATA代码
                       (inputValue.length >= 1 && /[\u4e00-\u9fa5]/.test(inputValue))     // 包含中文字符

    if (shouldSearch && this.data.airportDataLoaded) {
      const self = this
      this.arrivalSearchTimer = setTimeout(function() {
        self.lookupArrivalAirport(inputValue)
      }, CONFIG.DEBOUNCE_DELAY)
    } else if (!shouldSearch) {
      this.safeSetData({
        arrivalAirportInfo: null
      })
    }
  },

  /**
   * 查找出发机场
   */
  lookupDepartureAirport: function(query: string): void {
    const airports = this.findAirportsByQuery(query)

    if (airports.length === 0) {
      this.safeSetData({
        departureAirportInfo: null
      })
    } else if (airports.length === 1) {
      this.safeSetData({
        departureAirportInfo: airports[0]
      }, () => {
        // 机场信息更新后，触发自动计算检查
        this.triggerAutoCalculate()
      })
    } else {
      // 多个匹配结果，显示选择弹窗
      this.showAirportSelectionDialog(airports, 'departure', query)
    }
  },

  /**
   * 查找到达机场
   */
  lookupArrivalAirport: function(query: string): void {
    const airports = this.findAirportsByQuery(query)

    if (airports.length === 0) {
      this.safeSetData({
        arrivalAirportInfo: null
      })
    } else if (airports.length === 1) {
      this.safeSetData({
        arrivalAirportInfo: airports[0]
      }, () => {
        // 机场信息更新后，触发自动计算检查
        this.triggerAutoCalculate()
      })
    } else {
      // 多个匹配结果，显示选择弹窗
      this.showAirportSelectionDialog(airports, 'arrival', query)
    }
  },

  /**
   * 清除出发机场输入
   */
  clearDepartureInput: function(): void {
    this.safeSetData({
      departureIcaoCode: '',
      departureAirportInfo: null
    })
  },

  /**
   * 清除到达机场输入
   */
  clearArrivalInput: function(): void {
    this.safeSetData({
      arrivalIcaoCode: '',
      arrivalAirportInfo: null
    })
  },

  /**
   * 使用高性能搜索管理器查找机场
   */
  findAirportsByQuery: function(query: string): any[] {
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
      const searchResults = searchManager.searchAirports(query, CONFIG.MAX_SEARCH_RESULTS)

      // 转换搜索结果格式
      const results = searchResults.map((item: any) => ({
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
      this.handleError(error, '查找机场')
      // 降级到原始搜索方法
      return this.findAirportsByQueryFallback(query)
    }
  },

  /**
   * 降级搜索方法（保持兼容性）
   */
  findAirportsByQueryFallback: function(query: string): any[] {
    try {
      const dataManager = require('../../utils/data-manager.js')
      const airportData = dataManager.getCachedAirportData()

      if (!airportData || !Array.isArray(airportData)) {
        console.error('机场数据格式错误或未加载')
        return []
      }

      const results: any[] = []
      const upperQuery = query.toUpperCase()

      // 1. 优先匹配ICAO代码（精确匹配）
      for (let i = 0; i < airportData.length; i++) {
        const item = airportData[i]
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
      for (let i = 0; i < airportData.length; i++) {
        const item = airportData[i]
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
      for (let i = 0; i < airportData.length; i++) {
        const item = airportData[i]
        if (item.ShortName && item.ShortName.indexOf(query) !== -1) {
          const exists = results.some((r: any) => r.icaoCode === item.ICAOCode)
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
      if (results.length < CONFIG.MIN_SEARCH_RESULTS_BEFORE_ENGLISH) {
        for (let i = 0; i < airportData.length; i++) {
          const item = airportData[i]
          if (item.EnglishName && item.EnglishName.toUpperCase().indexOf(upperQuery) !== -1) {
            const exists = results.some((r: any) => r.icaoCode === item.ICAOCode)
            if (!exists && results.length < CONFIG.MAX_SEARCH_RESULTS) {
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
      this.handleError(error, '降级搜索')
      return []
    }
  },

  /**
   * 显示机场选择弹窗
   */
  showAirportSelectionDialog: function(airports: any[], type: string, query: string): void {
    if (airports.length === 0) return

    const actionItems: any[] = []
    for (let i = 0; i < airports.length; i++) {
      const airport = airports[i]
      // 改进显示格式：中文名 + ICAO + IATA（如果有的话）
      let displayName = airport.name
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

    let itemList = actionItems.map(function(item: any) { return item.name })

    // 微信小程序ActionSheet最多支持6个选项，如果超过则截取前6个
    if (itemList.length > CONFIG.MAX_ACTIONSHEET_ITEMS) {
      itemList = itemList.slice(0, CONFIG.MAX_ACTIONSHEET_ITEMS)
      airports = airports.slice(0, CONFIG.MAX_ACTIONSHEET_ITEMS)
    }

    const self = this
    wx.showActionSheet({
      itemList: itemList,
      success: function(res: any) {
        const selectedAirport = airports[res.tapIndex]
        const updateData: any = {}
        if (type === 'departure') {
          updateData.departureAirportInfo = selectedAirport
        } else {
          updateData.arrivalAirportInfo = selectedAirport
        }
        self.safeSetData(updateData, () => {
          // 用户选择机场后，触发自动计算检查
          self.triggerAutoCalculate()
        })
      },
      fail: function(err: any) {
        // 用户取消选择时给出提示
        const airportType = type === 'departure' ? '出发' : '到达'
        wx.showToast({
          title: `请选择具体的${airportType}机场`,
          icon: 'none',
          duration: CONFIG.TOAST_DURATION
        })
      }
    })
  },

  /**
   * 从机场数据中查找指定ICAO代码或中文名称的机场（单个结果）
   */
  findAirportByQuery: function(query: string): any {
    const airports = this.findAirportsByQuery(query)
    return airports.length > 0 ? airports[0] : null
  },

  /**
   * 保持向后兼容的ICAO查找方法
   */
  findAirportByICAO: function(icaoCode: string): any {
    return this.findAirportByQuery(icaoCode)
  },

  /**
   * 获取有效的出发时间戳
   */
  getValidDepartureTimestamp: function(): number {
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

  /**
   * 获取有效的到达时间戳
   */
  getValidArrivalTimestamp: function(): number {
    const time = this.data.arrivalTime
    if (time && time instanceof Date && !isNaN(time.getTime())) {
      const timestamp = time.getTime()
      // 确保在有效范围内
      if (timestamp >= this.data.minDate && timestamp <= this.data.maxDate) {
        return timestamp
      }
    }
    // 返回当前时间+2小时作为默认值
    return new Date().getTime() + CONFIG.DEFAULT_FLIGHT_DURATION_HOURS * CONFIG.MILLISECONDS_PER_HOUR
  },

  /**
   * 切换时间制式
   */
  toggleTimeZone: function(): void {
    const newTimeZone = !this.data.useBeijingTime

    // 一次性合并所有setData操作，提升性能
    const updateData: any = {
      useBeijingTime: newTimeZone
    }

    // 如果有夜航计算结果，需要重新计算
    const needRecalculate = !!this.data.nightFlightResults

    // 更新夜航模式的时间显示
    if (this.data.calculationType === 'nightflight') {
      if (this.data.departureTime && this.data.departureTime instanceof Date && !isNaN(this.data.departureTime.getTime())) {
        updateData.departureTimeStr = this.formatDateTime(this.data.departureTime)
      }
      if (this.data.arrivalTime && this.data.arrivalTime instanceof Date && !isNaN(this.data.arrivalTime.getTime())) {
        updateData.arrivalTimeStr = this.formatDateTime(this.data.arrivalTime)
      }
      // 更新有效时间戳
      updateData.validDepartureTimestamp = this.getValidDepartureTimestamp()
      updateData.validArrivalTimestamp = this.getValidArrivalTimestamp()
    }

    // ✅ 合并setData调用，提升性能
    this.safeSetData(updateData, () => {
      // 在setData完成后重新计算
      if (needRecalculate) {
        this.calculateNightFlightTime()
      }
    }, { priority: 'high' })
  },

  /**
   * 格式化坐标显示
   */
  formatCoordinateDisplay: function(coordinate: number[], type: 'latitude' | 'longitude' | 'both'): string {
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

  /**
   * 夜航模式 - 出发地坐标选择
   */
  showDepartureCoordinatePicker: function(): void {
    this.safeSetData({
      showDepartureCoordinatePicker: true
    })
  },

  closeDepartureCoordinatePicker: function(): void {
    this.safeSetData({
      showDepartureCoordinatePicker: false
    })
  },

  confirmDepartureCoordinate: function(event: any): void {
    const selectedCoordinate = event.detail.value
    this.safeSetData({
      selectedDepartureCoordinate: selectedCoordinate,
      departureCoordinate: this.formatCoordinateDisplay(selectedCoordinate, 'both'),
      showDepartureCoordinatePicker: false
    })
  },

  /**
   * 夜航模式 - 到达地坐标选择
   */
  showArrivalCoordinatePicker: function(): void {
    this.safeSetData({
      showArrivalCoordinatePicker: true
    })
  },

  closeArrivalCoordinatePicker: function(): void {
    this.safeSetData({
      showArrivalCoordinatePicker: false
    })
  },

  confirmArrivalCoordinate: function(event: any): void {
    const selectedCoordinate = event.detail.value
    this.safeSetData({
      selectedArrivalCoordinate: selectedCoordinate,
      arrivalCoordinate: this.formatCoordinateDisplay(selectedCoordinate, 'both'),
      showArrivalCoordinatePicker: false
    })
  },

  /**
   * ✅ 公共时间选择器逻辑 - 消除代码重复
   * @param type 'departure' | 'arrival'
   */
  _showTimePicker: function(type: 'departure' | 'arrival'): void {
    console.log(`📅 打开${type === 'departure' ? '出发' : '到达'}时间选择器`)

    // 检查页面状态
    if (!this.isPageValid || !this.isPageValid()) {
      console.warn('⚠️ 页面已销毁，取消打开日期选择器')
      return
    }

    const config = type === 'departure' ? {
      timeKey: 'departureTime',
      timestampKey: 'validDepartureTimestamp',
      timeStrKey: 'departureTimeStr',
      calendarKey: 'showDepartureCalendar',
      defaultOffset: 0
    } : {
      timeKey: 'arrivalTime',
      timestampKey: 'validArrivalTimestamp',
      timeStrKey: 'arrivalTimeStr',
      calendarKey: 'showArrivalCalendar',
      defaultOffset: CONFIG.DEFAULT_FLIGHT_DURATION_HOURS * CONFIG.MILLISECONDS_PER_HOUR
    }

    const now = new Date()
    const defaultTime = new Date(now.getTime() + config.defaultOffset)
    const currentTime = this.data[config.timeKey]

    const updateData: any = {}

    if (!currentTime || !(currentTime instanceof Date) || isNaN(currentTime.getTime())) {
      console.log('⚠️ 时间无效，使用默认时间:', defaultTime)
      updateData[config.timeKey] = defaultTime
      updateData[config.timestampKey] = defaultTime.getTime()
      updateData[config.timeStrKey] = this.formatDateTime(defaultTime)
    } else {
      console.log('✅ 时间有效:', currentTime)
      updateData[config.timestampKey] = currentTime.getTime()
    }

    updateData[config.calendarKey] = true

    // ✅ 一次性setData，减少渲染次数
    this.safeSetData(updateData, null, { priority: 'high' })
  },

  /**
   * 夜航模式 - 出发地时间选择（分步：先日历后时间）
   */
  showDepartureTimePicker: function(): void {
    this._showTimePicker('departure')
  },

  /**
   * 日历选择完成 - 出发时间
   */
  onDepartureDateConfirm: function(event: any): void {
    const selectedDate = new Date(event.detail)
    // 保存选择的日期，保留原有的时分秒
    const currentTime = this.data.departureTime || new Date()
    selectedDate.setHours(currentTime.getHours())
    selectedDate.setMinutes(currentTime.getMinutes())
    selectedDate.setSeconds(0)

    this.safeSetData({
      departureTime: selectedDate,
      showDepartureCalendar: false,
      showDepartureTimeOnly: true // 第二步：显示时间选择器
    })
  },

  /**
   * 关闭日历 - 出发时间
   */
  closeDepartureCalendar: function(): void {
    this.safeSetData({
      showDepartureCalendar: false
    })
  },

  /**
   * 时间选择完成 - 出发时间
   */
  onDepartureTimeConfirm: function(event: any): void {
    const timeStr = event.detail // 格式 "HH:mm"
    const [hours, minutes] = timeStr.split(':').map(Number)

    const departureTime = new Date(this.data.departureTime)
    departureTime.setHours(hours)
    departureTime.setMinutes(minutes)
    departureTime.setSeconds(0)

    this.safeSetData({
      departureTime: departureTime,
      departureTimeStr: this.formatDateTime(departureTime),
      validDepartureTimestamp: departureTime.getTime(),
      showDepartureTimeOnly: false
    }, () => {
      // 时间选择完成后，触发自动计算检查
      this.triggerAutoCalculate()
    })
  },

  closeDepartureTimePicker: function(): void {
    this.safeSetData({
      showDepartureTimePicker: false,
      showDepartureTimeOnly: false
    })
  },

  /**
   * 到达时间选择（分步：先日历后时间）
   */
  showArrivalTimePicker: function(): void {
    this._showTimePicker('arrival')
  },

  /**
   * 日历选择完成 - 到达时间
   */
  onArrivalDateConfirm: function(event: any): void {
    const selectedDate = new Date(event.detail)
    // 保存选择的日期，保留原有的时分秒
    const currentTime = this.data.arrivalTime || new Date()
    selectedDate.setHours(currentTime.getHours())
    selectedDate.setMinutes(currentTime.getMinutes())
    selectedDate.setSeconds(0)

    this.safeSetData({
      arrivalTime: selectedDate,
      showArrivalCalendar: false,
      showArrivalTimeOnly: true // 第二步：显示时间选择器
    })
  },

  /**
   * 关闭日历 - 到达时间
   */
  closeArrivalCalendar: function(): void {
    this.safeSetData({
      showArrivalCalendar: false
    })
  },

  /**
   * 时间选择完成 - 到达时间
   */
  onArrivalTimeConfirm: function(event: any): void {
    const timeStr = event.detail // 格式 "HH:mm"
    const [hours, minutes] = timeStr.split(':').map(Number)

    // 如果arrivalTime为null，使用当前日期作为基础
    const baseDate = this.data.arrivalTime || new Date()
    const arrivalTime = new Date(baseDate)
    arrivalTime.setHours(hours)
    arrivalTime.setMinutes(minutes)
    arrivalTime.setSeconds(0)

    this.safeSetData({
      arrivalTime: arrivalTime,
      arrivalTimeStr: this.formatDateTime(arrivalTime),
      validArrivalTimestamp: arrivalTime.getTime(),
      showArrivalTimeOnly: false
    }, () => {
      // 时间选择完成后，触发自动计算检查
      this.triggerAutoCalculate()
    })
  },

  closeArrivalTimePicker: function(): void {
    this.safeSetData({
      showArrivalTimePicker: false,
      showArrivalTimeOnly: false
    })
  },

  /**
   * 检查是否可以自动计算夜航时间
   */
  canAutoCalculate: function(): boolean {
    const { departureAirportInfo, arrivalAirportInfo, departureTime, arrivalTime } = this.data

    // 检查所有必需的参数是否存在
    if (!departureAirportInfo || !arrivalAirportInfo) {
      return false
    }

    if (!departureTime || !arrivalTime) {
      return false
    }

    // 检查时间有效性
    if (!(departureTime instanceof Date) || isNaN(departureTime.getTime())) {
      return false
    }

    if (!(arrivalTime instanceof Date) || isNaN(arrivalTime.getTime())) {
      return false
    }

    // 检查到达时间是否晚于出发时间
    if (arrivalTime <= departureTime) {
      return false
    }

    return true
  },

  /**
   * 触发自动计算（带防抖机制）
   */
  triggerAutoCalculate: function(): void {
    // 清除之前的定时器
    if (this.autoCalculateTimer) {
      clearTimeout(this.autoCalculateTimer)
      this.autoCalculateTimer = null
    }

    // 检查是否满足自动计算条件
    if (!this.canAutoCalculate()) {
      console.log('⏸️ 自动计算条件不满足，跳过计算')
      return
    }

    // 使用防抖机制，避免频繁计算
    const self = this
    this.autoCalculateTimer = setTimeout(function() {
      console.log('🔄 自动触发夜航时间计算')
      self.performNightFlightCalculation()
    }, CONFIG.DEBOUNCE_DELAY)
  },

  /**
   * 夜航时间计算
   */
  calculateNightFlightTime: function(): void {
    const self = this

    // 参数验证
    const departureTime = self.data.departureTime
    const arrivalTime = self.data.arrivalTime
    const departureAirportInfo = self.data.departureAirportInfo
    const arrivalAirportInfo = self.data.arrivalAirportInfo

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

    // ✅ 清除自动计算定时器，避免重复计算
    if (this.autoCalculateTimer) {
      clearTimeout(this.autoCalculateTimer)
      this.autoCalculateTimer = null
      console.log('🔄 手动计算触发，已清除自动计算定时器')
    }

    // 直接执行计算
    self.performNightFlightCalculation()
  },

  /**
   * 分离出来的实际夜航时间计算逻辑
   */
  performNightFlightCalculation: function(): void {
    // ✅ 防重入检查
    if (this.data.calculating) {
      console.log('⏸️ 计算正在进行中，跳过本次请求')
      return
    }

    const departureTime = this.data.departureTime
    const arrivalTime = this.data.arrivalTime
    const departureAirportInfo = this.data.departureAirportInfo
    const arrivalAirportInfo = this.data.arrivalAirportInfo

    try {
      // ✅ 标记计算开始
      this.safeSetData({ calculating: true })

      // 从机场信息中获取坐标
      const departureCoord = {
        lat: departureAirportInfo.latitude,
        lng: departureAirportInfo.longitude
      }
      const arrivalCoord = {
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

      this.safeSetData({
        nightFlightResults: results,
        calculating: false // ✅ 标记计算完成
      }, () => {
        // 自动滚动到夜航计算结果区域
        setTimeout(() => {
          const query = wx.createSelectorQuery()
          query.select('.results-card').boundingClientRect()
          query.exec((res: any) => {
            if (res[0]) {
              wx.pageScrollTo({
                scrollTop: res[0].top,
                duration: CONFIG.SCROLL_DURATION
              })
            }
          })
        }, CONFIG.SCROLL_DELAY)
      })

      wx.showToast({
        title: '计算完成',
        icon: 'success'
      })

    } catch (error) {
      // ✅ 错误时清除calculating标志
      this.safeSetData({ calculating: false })
      this.handleError(error, '夜航时间计算')
    }
  },

  /**
   * 辅助方法 - 从数组解析坐标
   */
  parseCoordinateFromArray: function(coordinate: number[]): { lat: number, lng: number } {
    const [latDirIndex, latDegrees, lngDirIndex, lngDegrees] = coordinate
    const latDirections = ['N', 'S']
    const lngDirections = ['E', 'W']
    const latDirection = latDirections[latDirIndex]
    const lngDirection = lngDirections[lngDirIndex]

    const lat = latDirection === 'N' ? latDegrees : -latDegrees
    const lng = lngDirection === 'E' ? lngDegrees : -lngDegrees

    return { lat, lng }
  },

  /**
   * 精确的夜航时间计算：1分钟间隔插值，沿途判断夜间
   */
  calculateNightTimeDetailed: function(departureTime: Date, arrivalTime: Date, departureTimes: any, arrivalTimes: any): any {

    const departureTimeMs = departureTime.getTime()
    const arrivalTimeMs = arrivalTime.getTime()
    const flightDurationMs = arrivalTimeMs - departureTimeMs

    // 出发地和到达地坐标
    const depLat = departureTimes.lat
    const depLng = departureTimes.lng
    const arrLat = arrivalTimes.lat
    const arrLng = arrivalTimes.lng


    // 1分钟 = 60000毫秒
    const intervalMs = CONFIG.CALCULATION_INTERVAL_MINUTES * CONFIG.MILLISECONDS_PER_MINUTE
    let totalNightTime = 0
    // 🔧 Bug #3修复：分别记录第一次进入和最后一次退出时间
    let firstNightEntryTime = null  // 第一次进入夜间的时间
    let lastNightExitTime = null    // 最后一次退出夜间的时间
    let currentNightEntryTime = null // 当前夜航段的进入时间
    let inNightPeriod = false

    // 如果飞行时间少于1分钟，直接检查中点
    if (flightDurationMs <= intervalMs) {
      const midTime = new Date((departureTimeMs + arrivalTimeMs) / 2)
      const midLat = (depLat + arrLat) / 2
      const midLng = (depLng + arrLng) / 2
      const midSunTimes = SunCalc.getTimes(midTime, midLat, midLng)

      if (this.isNightTime(midTime, midSunTimes)) {
        totalNightTime = flightDurationMs
        firstNightEntryTime = departureTime
        lastNightExitTime = arrivalTime
      }
    } else {
      // 长途飞行：1分钟间隔精确计算
      const numIntervals = Math.ceil(flightDurationMs / intervalMs)

      for (let i = 0; i <= numIntervals; i++) {
        const currentTimeMs = Math.min(departureTimeMs + i * intervalMs, arrivalTimeMs)
        const currentTime = new Date(currentTimeMs)

        // 计算当前时间点的飞行进度 (0-1)
        const progress = (currentTimeMs - departureTimeMs) / flightDurationMs

        // 🔧 Issue #5修复：使用大圆航线插值代替线性插值
        const interpolatedPos = this.greatCircleInterpolate(depLat, depLng, arrLat, arrLng, progress)
        const currentLat = interpolatedPos.lat
        const currentLng = interpolatedPos.lng

        // 计算当前位置的日出日落时间
        const currentSunTimes = SunCalc.getTimes(currentTime, currentLat, currentLng)
        // 将经纬度信息添加到sunTimes对象中
        currentSunTimes.lat = currentLat
        currentSunTimes.lng = currentLng
        const isCurrentNight = this.isNightTime(currentTime, currentSunTimes)


        if (isCurrentNight && !inNightPeriod) {
          // 进入夜间
          currentNightEntryTime = currentTime
          // 🔧 Bug #3修复：只在第一次进入夜间时记录
          if (!firstNightEntryTime) {
            firstNightEntryTime = currentTime
          }
          inNightPeriod = true
        } else if (!isCurrentNight && inNightPeriod && currentNightEntryTime) {
          // 退出夜间
          lastNightExitTime = currentTime
          const nightSegmentTime = currentTimeMs - currentNightEntryTime.getTime()
          totalNightTime += nightSegmentTime
          inNightPeriod = false
          // 🔧 Bug #1修复：设置标志避免重复累加
          currentNightEntryTime = null
        }

        // 如果到达最后一个时间点且仍在夜间（且未在上面退出时累加过）
        if (i === numIntervals && inNightPeriod && currentNightEntryTime) {
          lastNightExitTime = arrivalTime
          const nightSegmentTime = arrivalTimeMs - currentNightEntryTime.getTime()
          totalNightTime += nightSegmentTime
          inNightPeriod = false
        }
      }
    }


    return {
      totalNightTime: Math.max(0, totalNightTime),
      entryTime: firstNightEntryTime,  // 🔧 Bug #3修复：返回第一次进入时间
      exitTime: lastNightExitTime,     // 🔧 Bug #3修复：返回最后一次退出时间
      periods: []
    }
  },

  /**
   * 夜航时间计算（备用算法）
   */
  calculateNightTime: function(departureTime: Date, arrivalTime: Date, departureTimes: any, arrivalTimes: any): number {
    /**
     * 跨时区夜航时间计算算法说明：
     *
     * 1. 基本原理：
     *    - 夜间飞行定义：按照中国民航局规定，日落后1小时至日出前1小时之间的时间段
     *    - 跨时区飞行需要考虑沿途不同位置的日出日落时间变化
     *
     * 2. 计算方法：
     *    - 短途飞行（<30分钟）：简化判断出发时是否为夜间
     *    - 长途飞行：分段计算，每1分钟一段（高精度计算）
     *    - 每段使用线性插值估算中点位置
     *    - 计算中点位置的当地日出日落时间
     *    - 判断该时间段是否为夜间（日落后1小时至日出前1小时）
     *
     * 3. 示例：
     *    - 从北京(UTC+8)飞往伦敦(UTC+0)
     *    - 出发：20:00 北京时间（日落后1小时前，非夜间）
     *    - 出发：21:00 北京时间（日落后1小时后，夜间）
     *    - 飞行过程中每分钟都会计算当地的日出日落时间+1小时偏移
     */

    // 改进的夜航时间计算算法
    // 基于中国民航规章，夜间飞行时间的定义是日落后1小时至日出前1小时之间的时间段

    let nightTime = 0
    const flightDuration = arrivalTime.getTime() - departureTime.getTime()

    // 如果飞行时间很短（小于30分钟），简化处理
    if (flightDuration < CONFIG.SHORT_FLIGHT_THRESHOLD_MINUTES * CONFIG.MILLISECONDS_PER_MINUTE) {
      // 检查出发时间是否在夜间
      if (this.isNightTime(departureTime, departureTimes)) {
        return flightDuration
      } else {
        return 0
      }
    }

    // 对于较长的飞行，分段计算夜间时间
    // 将飞行过程分为多个时间段，每段检查是否为夜间
    const segments = Math.ceil(flightDuration / (CONFIG.CALCULATION_INTERVAL_MINUTES * CONFIG.MILLISECONDS_PER_MINUTE)) // 每1分钟一段（高精度）
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

  /**
   * 判断给定时间是否为夜间：按照中国民航局规定"日落后1小时至日出前1小时"
   */
  isNightTime: function(time: Date, sunTimes: any): boolean {
    const currentTime = time.getTime()
    const sunrise = sunTimes.sunrise.getTime()
    const sunset = sunTimes.sunset.getTime()

    // 🔧 Issue #4修复：处理极昼/极夜场景
    // 在极地地区，日出日落时间可能为NaN
    if (isNaN(sunrise) || isNaN(sunset)) {
      // 使用太阳高度角判断（太阳高度角 < 0 表示太阳在地平线以下，即夜间）
      const position = SunCalc.getPosition(time, sunTimes.lat, sunTimes.lng)
      return position.altitude < 0
    }

    // 🔥 简化的夜间判断逻辑：
    // 夜间时间段：从日落后1小时开始，到日出前1小时结束
    const nightStart = sunset + CONFIG.NIGHT_HOUR_OFFSET * CONFIG.MILLISECONDS_PER_HOUR     // 日落后1小时
    const nightEnd = sunrise - CONFIG.NIGHT_HOUR_OFFSET * CONFIG.MILLISECONDS_PER_HOUR      // 日出前1小时

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

    return isNight
  },

  /**
   * 坐标线性插值
   */
  interpolateCoordinate: function(start: number, end: number, progress: number): number {
    return start + (end - start) * progress
  },

  /**
   * 🔧 Issue #5修复：球面线性插值（大圆航线）
   * 用于计算地球表面两点之间的中间点（考虑地球曲率）
   */
  greatCircleInterpolate: function(lat1: number, lon1: number, lat2: number, lon2: number, fraction: number): {lat: number, lng: number} {
    // 将角度转换为弧度
    const toRadians = (deg: number) => deg * Math.PI / 180
    const toDegrees = (rad: number) => rad * 180 / Math.PI

    const φ1 = toRadians(lat1)
    const φ2 = toRadians(lat2)
    const λ1 = toRadians(lon1)
    const λ2 = toRadians(lon2)

    // 计算两点之间的角距离
    const Δφ = φ2 - φ1
    const Δλ = λ2 - λ1

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    // 如果两点距离很近（<1度），使用线性插值即可
    if (δ < 0.017) { // 约1度
      return {
        lat: lat1 + (lat2 - lat1) * fraction,
        lng: lon1 + (lon2 - lon1) * fraction
      }
    }

    // 球面线性插值（Slerp）
    const A = Math.sin((1-fraction) * δ) / Math.sin(δ)
    const B = Math.sin(fraction * δ) / Math.sin(δ)

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
    const z = A * Math.sin(φ1) + B * Math.sin(φ2)

    const φ3 = Math.atan2(z, Math.sqrt(x*x + y*y))
    const λ3 = Math.atan2(y, x)

    return {
      lat: toDegrees(φ3),
      lng: toDegrees(λ3)
    }
  },

  /**
   * 格式化日期时间
   */
  formatDateTime: function(date: Date): string {
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
      // 🔧 Bug #2修复：UTC时间显示 - 使用UTC方法获取时间
      hours = date.getUTCHours()
      minutes = date.getUTCMinutes()
    }

    const timeZoneIndicator = this.data.useBeijingTime ? ' (北京时)' : ' (UTC)'
    const hourStr = hours < 10 ? '0' + hours : hours.toString()
    const minuteStr = minutes < 10 ? '0' + minutes : minutes.toString()
    return `${year}-${month}-${day} ${hourStr}:${minuteStr}${timeZoneIndicator}`
  },

  /**
   * 格式化时间
   */
  formatTime: function(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '无法计算'
    }

    let hours: number
    let minutes: number

    if (this.data.useBeijingTime) {
      // 北京时间 = UTC + 8小时
      const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
      hours = beijingTime.getUTCHours()
      minutes = beijingTime.getUTCMinutes()
    } else {
      // UTC时间
      hours = date.getUTCHours()
      minutes = date.getUTCMinutes()
    }

    const hourStr = hours < 10 ? '0' + hours : hours.toString()
    const minuteStr = minutes < 10 ? '0' + minutes : minutes.toString()
    return hourStr + ':' + minuteStr
  },

  /**
   * 格式化时长
   */
  formatDuration: function(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}小时${minutes}分钟`
  },

  /**
   * 更新有效的时间戳
   */
  updateValidTimestamps: function(): void {
    this.safeSetData({
      validDepartureTimestamp: this.getValidDepartureTimestamp(),
      validArrivalTimestamp: this.getValidArrivalTimestamp()
    })
  },
}

// ✅ 使用BasePage.createPage()创建页面，符合项目架构规范
Page(BasePage.createPage(pageConfig))
