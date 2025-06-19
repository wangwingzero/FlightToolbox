// 日出日落时间计算页面
const SunCalc = require('../../utils/suncalc.js')
const buttonChargeManager = require('../../utils/button-charge-manager.js') // 扣费管理器

Page({
  data: {
    // 功能选择
    calculationType: 'nightflight', // 'sunrise' 或 'nightflight' - 默认夜航时间计算，飞行员使用频率更高
    showCalculationTypeActionSheet: false,
    calculationTypeActions: [
      { name: '日出日落查询', value: 'sunrise' },
      { name: '夜航时间计算', value: 'nightflight' }
    ],

    // 坐标输入
    latitudeInput: '',
    longitudeInput: '',
    
    // 日期选择
    selectedDate: new Date(),
    selectedDateStr: '',
    showCalendar: false,
    minDate: new Date(2020, 0, 1).getTime(), // 从2020年1月1日开始，确保覆盖当前时间
    maxDate: new Date(2050, 11, 31).getTime(), // 到2050年结束
    
    // 计算结果和时间制式
    sunResults: null as any,
    useBeijingTime: true,  // 默认使用北京时间
    
    // 坐标选择器相关
    showCoordinatePicker: false,

    // 夜航计算相关
    departureCoordinate: '',
    arrivalCoordinate: '',
    departureTime: new Date(),
    arrivalTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 默认比出发时间晚2小时
    departureTimeStr: '',
    arrivalTimeStr: '',
    nightFlightResults: null as any,
    
    // 夜航选择器状态
    showDepartureCoordinatePicker: false,
    showArrivalCoordinatePicker: false,
    showDepartureTimePicker: false,
    showArrivalTimePicker: false,
    selectedDepartureCoordinate: [0, 31, 0, 121],  // 上海坐标N31E121
    selectedArrivalCoordinate: [0, 31, 0, 121],    // 上海坐标N31E121
    
    // 4列坐标选择器数据 - Vant标准格式
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
    selectedCoordinate: [0, 31, 0, 121], // 对应的索引值 - 上海坐标N31E121
    
    // 时间戳，供datetime-picker使用
    validDepartureTimestamp: new Date().getTime(),
    validArrivalTimestamp: new Date().getTime() + 2 * 60 * 60 * 1000
  },

  onLoad() {
    // 根据默认的计算类型设置导航栏标题
    const title = this.data.calculationType === 'sunrise' ? '日出日落查询' : '夜航时间计算'
    wx.setNavigationBarTitle({
      title: title
    })
    
    // 获取当前时间
    const now = new Date()
    
    // 初始化坐标显示（使用默认值）
    const defaultLatitude = `${this.data.coordinateColumns[0].values[0]}${this.data.selectedCoordinate[1]}` // N31
    const defaultLongitude = `${this.data.coordinateColumns[2].values[0]}${this.data.selectedCoordinate[3]}` // E121
    
    // 初始化夜航模式的默认时间为当前时间
    const departureTime = new Date(now.getTime())
    const arrivalTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 默认比出发时间晚2小时
    
    this.setData({
      selectedDate: now,
      selectedDateStr: this.formatDate(now),
      latitudeInput: defaultLatitude,
      longitudeInput: defaultLongitude,
      // 夜航模式初始化为当前时间
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      departureTimeStr: this.formatDateTime(departureTime),
      arrivalTimeStr: this.formatDateTime(arrivalTime),
      departureCoordinate: `${defaultLatitude} ${defaultLongitude}`,
      arrivalCoordinate: `${defaultLatitude} ${defaultLongitude}`,
      // 设置有效的时间戳
      validDepartureTimestamp: departureTime.getTime(),
      validArrivalTimestamp: arrivalTime.getTime()
    })
  },

  // 获取有效的出发时间戳
  getValidDepartureTimestamp() {
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

  // 日期选择器
  showDatePicker() {
    this.setData({
      showCalendar: true
    })
  },

  closeDatePicker() {
    this.setData({
      showCalendar: false
    })
  },

  selectDate(event: any) {
    // DatetimePicker返回的是时间戳
    const selectedDate = new Date(event.detail)
    this.setData({
      selectedDate: selectedDate,
      selectedDateStr: this.formatDate(selectedDate),
      showCalendar: false
    })
  },

  // 切换时间制式
  toggleTimeZone() {
    const newTimeZone = !this.data.useBeijingTime
    this.setData({
      useBeijingTime: newTimeZone
    })
    
    // 如果已有计算结果，重新计算并显示
    if (this.data.sunResults) {
      this.calculateSunTimes()
    }
    
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

  // 显示坐标选择器
  showCoordinatePicker() {
    this.setData({
      showCoordinatePicker: true
    })
  },

  // 关闭坐标选择器
  closeCoordinatePicker() {
    this.setData({
      showCoordinatePicker: false
    })
  },

  // 坐标picker变化事件
  onCoordinatePickerChange(event: any) {
    const selectedCoordinate = event.detail.value
    this.setData({
      selectedCoordinate: selectedCoordinate
    })
  },

  // 确认坐标选择
  confirmCoordinate(event: any) {
    const selectedCoordinate = event.detail.value
    this.setData({
      selectedCoordinate: selectedCoordinate,
      latitudeInput: this.formatCoordinateDisplay(selectedCoordinate, 'latitude'),
      longitudeInput: this.formatCoordinateDisplay(selectedCoordinate, 'longitude'),
      showCoordinatePicker: false
    })
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

  // 计算日出日落时间
  calculateSunTimes() {
    // 参数验证函数
    const validateParams = () => {
      if (!this.data.selectedCoordinate || this.data.selectedCoordinate.length !== 4) {
        return { valid: false, message: '请先选择坐标' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performSunTimesCalculation();
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'sun-times-calc',
      validateParams,
      '日出日落时间计算',
      performCalculation
    );
  },

  // 分离出来的实际日出日落计算逻辑
  performSunTimesCalculation() {
    const { selectedDate } = this.data

    let lat: number, lng: number

    // 从4列选择器获取坐标 [纬度方向索引, 纬度度数, 经度方向索引, 经度度数]
    const [latDirIndex, latDegrees, lngDirIndex, lngDegrees] = this.data.selectedCoordinate
    
    console.log('选择的坐标数组:', this.data.selectedCoordinate)
    console.log('解析结果:', { latDirIndex, latDegrees, lngDirIndex, lngDegrees })
    
    const latDirections = ['N', 'S']
    const lngDirections = ['E', 'W']
    const latDirection = latDirections[latDirIndex] || 'N'
    const lngDirection = lngDirections[lngDirIndex] || 'E'
    
    console.log('方向字母:', { latDirection, lngDirection })
    
    // 确保度数是数字类型
    const latDegreesNum = Number(latDegrees)
    const lngDegreesNum = Number(lngDegrees)
    
    lat = latDirection === 'N' ? latDegreesNum : -latDegreesNum
    lng = lngDirection === 'E' ? lngDegreesNum : -lngDegreesNum

    console.log('最终坐标:', { lat, lng })

    try {
      // 使用SunCalc计算日出日落时间
      const times = SunCalc.getTimes(selectedDate, lat, lng)

      // 格式化结果显示
      const coordinateDisplay = `${latDirection}${latDegreesNum} ${lngDirection}${lngDegreesNum}`
      
      const results = {
        date: this.formatDate(selectedDate),
        coordinates: coordinateDisplay,
        sunrise: this.formatTime(times.sunrise),
        sunset: this.formatTime(times.sunset)
      }

      console.log('计算结果:', results)

      this.setData({
        sunResults: results
      })

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
  formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1)
    const day = (date.getDate() < 10 ? '0' : '') + date.getDate()
    return `${year}-${month}-${day}`
  },

  formatTime(date: Date): string {
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
    return `${hourStr}:${minuteStr}`
  },

  // FMS格式解析函数
  parseFMSLatitude(input: string): { valid: boolean; value?: number; error?: string } {
    if (!input) {
      return { valid: false, error: '请输入纬度' }
    }

    // 去除空格和特殊字符，转大写
    const cleaned = input.replace(/[°\s]/g, '').toUpperCase()
    
    // 匹配格式：N45, S30, N45°, S30° 等
    const match = cleaned.match(/^([NS])(\d{1,2})$/)
    
    if (!match) {
      return { valid: false, error: '格式错误，请使用N45或S30格式' }
    }

    const direction = match[1]
    const degrees = parseInt(match[2])

    if (degrees > 90) {
      return { valid: false, error: '纬度不能超过90度' }
    }

    const value = direction === 'N' ? degrees : -degrees
    return { valid: true, value }
  },

  parseFMSLongitude(input: string): { valid: boolean; value?: number; error?: string } {
    if (!input) {
      return { valid: false, error: '请输入经度' }
    }

    // 去除空格和特殊字符，转大写
    const cleaned = input.replace(/[°\s]/g, '').toUpperCase()
    
    // 匹配格式：E010, W120, E10, W12 等
    const match = cleaned.match(/^([EW])(\d{1,3})$/)
    
    if (!match) {
      return { valid: false, error: '格式错误，请使用E010或W120格式' }
    }

    const direction = match[1]
    const degrees = parseInt(match[2])

    if (degrees > 180) {
      return { valid: false, error: '经度不能超过180度' }
    }

    const value = direction === 'E' ? degrees : -degrees
    return { valid: true, value }
  },

  // 功能选择相关方法
  showCalculationTypePicker() {
    this.setData({
      showCalculationTypeActionSheet: true
    })
  },

  closeCalculationTypePicker() {
    this.setData({
      showCalculationTypeActionSheet: false
    })
  },

  selectCalculationType(event: any) {
    const calculationType = event.detail.value
    
    // 根据选择的计算类型动态设置导航栏标题
    const title = calculationType === 'sunrise' ? '日出日落查询' : '夜航时间计算'
    wx.setNavigationBarTitle({
      title: title
    })
    
    this.setData({
      calculationType: calculationType,
      showCalculationTypeActionSheet: false
    })
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
    
    console.log('选择的出发时间:', departureTime)
    console.log('时间戳:', event.detail)
    console.log('当前时区设置:', this.data.useBeijingTime ? '北京时' : 'UTC')
    
    const formattedTime = this.formatDateTime(departureTime)
    console.log('格式化后的时间:', formattedTime)
    
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
    
    console.log('选择的到达时间:', arrivalTime)
    console.log('时间戳:', event.detail)
    console.log('当前时区设置:', this.data.useBeijingTime ? '北京时' : 'UTC')
    
    const formattedTime = this.formatDateTime(arrivalTime)
    console.log('格式化后的时间:', formattedTime)
    
    this.setData({
      arrivalTime: arrivalTime,
      arrivalTimeStr: formattedTime,
      validArrivalTimestamp: arrivalTime.getTime(),
      showArrivalTimePicker: false
    })
  },

  // 夜航时间计算
  calculateNightFlightTime() {
    // 参数验证函数
    const validateParams = () => {
      const { departureTime, arrivalTime, selectedDepartureCoordinate, selectedArrivalCoordinate } = this.data;

      if (!selectedDepartureCoordinate || !selectedArrivalCoordinate) {
        return { valid: false, message: '请选择出发和到达坐标' };
      }

      if (!departureTime || !arrivalTime) {
        return { valid: false, message: '请选择出发和到达时间' };
      }

      if (arrivalTime <= departureTime) {
        return { valid: false, message: '到达时间必须晚于出发时间' };
      }
      
      return { valid: true };
    };

    // 实际计算逻辑
    const performCalculation = () => {
      this.performNightFlightCalculation();
    };

    // 使用扣费管理器执行计算
    buttonChargeManager.executeCalculateWithCharge(
      'night-flight-calc',
      validateParams,
      '夜航时间计算',
      performCalculation
    );
  },

  // 分离出来的实际夜航时间计算逻辑
  performNightFlightCalculation() {
    const { departureTime, arrivalTime, selectedDepartureCoordinate, selectedArrivalCoordinate } = this.data

    try {
      // 解析坐标
      const departureCoord = this.parseCoordinateFromArray(selectedDepartureCoordinate)
      const arrivalCoord = this.parseCoordinateFromArray(selectedArrivalCoordinate)

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
    console.log('开始精确夜航计算 - 5分钟间隔插值法')
    
    const departureTimeMs = departureTime.getTime()
    const arrivalTimeMs = arrivalTime.getTime()
    const flightDurationMs = arrivalTimeMs - departureTimeMs
    
    // 出发地和到达地坐标
    const depLat = departureTimes.lat
    const depLng = departureTimes.lng
    const arrLat = arrivalTimes.lat  
    const arrLng = arrivalTimes.lng
    
    console.log(`飞行路径: (${depLat}, ${depLng}) -> (${arrLat}, ${arrLng})`)
    console.log(`飞行时间: ${this.formatDuration(flightDurationMs)}`)
    
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
        console.log('短途飞行，全程夜间')
      } else {
        console.log('短途飞行，全程白天')
      }
    } else {
      // 长途飞行：5分钟间隔精确计算
      const numIntervals = Math.ceil(flightDurationMs / intervalMs)
      console.log(`分为 ${numIntervals} 个5分钟间隔进行计算`)
      
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
        const isCurrentNight = this.isNightTime(currentTime, currentSunTimes)
        
        console.log(`时间点 ${i}: ${this.formatDateTime(currentTime)} 位置:(${currentLat.toFixed(2)}, ${currentLng.toFixed(2)}) 夜间:${isCurrentNight}`)
        
        if (isCurrentNight && !inNightPeriod) {
          // 进入夜间
          nightEntryTime = currentTime
          inNightPeriod = true
          console.log(`进入夜间: ${this.formatDateTime(currentTime)}`)
                 } else if (!isCurrentNight && inNightPeriod && nightEntryTime) {
           // 退出夜间
           nightExitTime = currentTime
           const nightSegmentTime = currentTimeMs - nightEntryTime.getTime()
           totalNightTime += nightSegmentTime
           inNightPeriod = false
           console.log(`退出夜间: ${this.formatDateTime(currentTime)}, 本段夜航时间: ${this.formatDuration(nightSegmentTime)}`)
         }
         
         // 如果到达最后一个时间点且仍在夜间
         if (i === numIntervals && inNightPeriod && nightEntryTime) {
           nightExitTime = arrivalTime
           const nightSegmentTime = arrivalTimeMs - nightEntryTime.getTime()
           totalNightTime += nightSegmentTime
           console.log(`飞行结束时仍在夜间，最后段夜航时间: ${this.formatDuration(nightSegmentTime)}`)
         }
      }
    }
    
    console.log(`夜航计算完成 - 总夜航时间: ${this.formatDuration(totalNightTime)}`)
    console.log(`夜航进入时间: ${nightEntryTime ? this.formatDateTime(nightEntryTime) : '无'}`)
    console.log(`夜航退出时间: ${nightExitTime ? this.formatDateTime(nightExitTime) : '无'}`)
    
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
    const timeOfDay = time.getTime()
    const sunset = sunTimes.sunset.getTime()
    const sunrise = sunTimes.sunrise.getTime()
    
    // 中国民航局规定：夜间 = 日落后1小时至日出前1小时之间的时间段
    const nightStart = sunset + (60 * 60 * 1000) // 日落后1小时
    const nightEnd = sunrise - (60 * 60 * 1000)   // 日出前1小时
    
    // 夜间时间跨越午夜的情况
    // 如果日落后1小时 > 日出前1小时（跨午夜），则：
    // 夜间 = 时间 >= 日落后1小时 OR 时间 <= 日出前1小时
    // 如果日落后1小时 < 日出前1小时（同一天），则：
    // 夜间 = 时间 >= 日落后1小时 AND 时间 <= 日出前1小时
    
    let isNight: boolean
    if (nightStart > nightEnd) {
      // 跨午夜情况（正常情况）
      isNight = (timeOfDay >= nightStart) || (timeOfDay <= nightEnd)
    } else {
      // 同一天情况（极地或特殊纬度）
      isNight = (timeOfDay >= nightStart) && (timeOfDay <= nightEnd)
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
  }
}) 