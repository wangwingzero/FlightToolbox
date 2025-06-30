/**
 * 长航线换班页面
 * 为长航线飞行提供机组换班时间计算工具
 */

interface FlightRotationData {
  // 输入参数
  departureTime: Date
  flightDuration: { hours: number, minutes: number }
  crewCount: number // 2-5套
  rotationStartAfter: { hours: number, minutes: number }
  rotationEndBefore: { hours: number, minutes: number }
  rotationInterval: { hours: number, minutes: number }
  
  // 计算结果
  arrivalTime: Date
  rotationStartTime: Date
  rotationEndTime: Date
  dutySchedule: DutyPeriod[]
  restSchedule: RestPeriod[]
}

interface DutyPeriod {
  crewNumber: number
  startTime: Date
  endTime: Date
  duration: { hours: number, minutes: number }
  phase: 'takeoff' | 'cruise' | 'landing'
  displayStartTime: string
  displayEndTime: string
  displayDuration: string
}

interface RestPeriod {
  crewNumber: number
  startTime: Date
  endTime: Date
  duration: { hours: number, minutes: number }
  displayStartTime: string
  displayEndTime: string
  displayDuration: string
}

Page({
  data: {
    // 输入参数
    departureTime: Date.now(),
    departureTimeValue: '01:42', // 用于datetime-picker的值
    departureTimeDisplay: '',
    minDate: new Date(2025, 0, 1).getTime(), // 从2025年开始
    maxDate: new Date(2026, 11, 31).getTime(), // 到2026年结束
    flightHours: 8,
    flightMinutes: 30,
    crewCount: 2,
    rotationRounds: 1, // 默认换班1轮
    
    // 选择器显示状态
    showDepartureTimePicker: false,
    showFlightDurationPicker: false,
    
    // 选择器数据
    flightDurationColumns: [],
    
    // 计算结果
    rotationResult: null,
    showResult: false
  },

    onLoad() {
    this.initializeData()
    this.setupTimePickerColumns()
  },

  // 初始化数据
  initializeData() {
    const now = new Date()
    // 设置默认起飞时间为当前时间的时间戳
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    this.setData({
      departureTime: now.getTime(),
      departureTimeValue: timeString,
      departureTimeDisplay: this.formatTime(now)
    })
  },

  // 设置时间选择器的列数据
  setupTimePickerColumns() {
    // 飞行时间选择器（0-20小时，0-59分钟）
    const flightDurationColumns = [
      {
        values: Array.from({ length: 21 }, (_, i) => i.toString()), // 0-20小时
        defaultIndex: 8 // 默认8小时
      },
      {
        values: Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), // 00-59分钟
        defaultIndex: 30 // 默认30分钟
      }
    ]

    this.setData({
      flightDurationColumns
    })
  },

  // 显示起飞时间选择器
  showDepartureTimePicker() {
    this.setData({ showDepartureTimePicker: true })
  },

  // 关闭起飞时间选择器
  closeDepartureTimePicker() {
    this.setData({ showDepartureTimePicker: false })
  },

  // 确认选择起飞时间
  confirmDepartureTime(event: any) {
    const timeString = event.detail // 格式: "HH:mm"
    const [hours, minutes] = timeString.split(':').map(Number)
    
    // 创建今天的日期对象，设置选择的时间
    const today = new Date()
    const selectedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
    
    this.setData({
      departureTime: selectedTime.getTime(),
      departureTimeValue: timeString,
      departureTimeDisplay: this.formatTime(selectedTime),
      showDepartureTimePicker: false,
      showResult: false
    })
  },

  // 显示飞行时间选择器
  showFlightDurationPicker() {
    this.setData({ showFlightDurationPicker: true })
  },

  // 关闭飞行时间选择器
  closeFlightDurationPicker() {
    this.setData({ showFlightDurationPicker: false })
  },

  // 确认选择飞行时间
  confirmFlightDuration(event: any) {
    const selectedValue = event.detail.value
    const hours = parseInt(selectedValue[0])
    const minutes = parseInt(selectedValue[1])
    
    this.setData({
      flightHours: hours,
      flightMinutes: minutes,
      showFlightDurationPicker: false,
      showResult: false
    })
  },

  // 机组套数变化
  onCrewCountChange(event: any) {
    this.setData({
      crewCount: event.detail,
      showResult: false
    })
  },
  
  // 换班轮数变化
  onRotationRoundsChange(event: any) {
    this.setData({
      rotationRounds: event.detail,
      showResult: false
    })
  },





  // 🎯 基于Context7最佳实践：计算换班安排（已在进入页面时扣除3积分）
  calculateRotation() {
    try {
      const result = this.performRotationCalculation()
      if (result) {
        this.setData({
          rotationResult: result,
          showResult: true
        })
        
        // 显示成功提示
        wx.showToast({
          title: '计算完成',
          icon: 'success',
          duration: 1500
        })
        
        // 触觉反馈
        wx.vibrateShort()
        
        // 滚动到结果区域
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '#result-section',
            duration: 500
          })
        }, 100)
      }
    } catch (error) {
      console.error('计算换班安排失败:', error)
      wx.showToast({
        title: '计算失败，请检查输入参数',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 执行换班计算
  performRotationCalculation(): FlightRotationData | null {
    const {
      departureTime,
      flightHours,
      flightMinutes,
      crewCount,
      rotationRounds
    } = this.data

    // 验证输入
    if (!departureTime) {
      wx.showToast({ title: '请选择起飞时间', icon: 'none' })
      return null
    }

    const departure = new Date(departureTime)
    
    // 计算关键时间点
    const totalFlightMinutes = flightHours * 60 + flightMinutes
    const arrival = this.addMinutes(departure, totalFlightMinutes)

    // 正确的多轮换班逻辑：总飞行时间 ÷ 机组套数 ÷ 轮数 = 每套组每轮的平均时间
    const averageMinutesPerCrewPerRound = Math.floor(totalFlightMinutes / (crewCount * rotationRounds))
    const averageHours = Math.floor(averageMinutesPerCrewPerRound / 60)
    const averageRemainingMinutes = averageMinutesPerCrewPerRound % 60

    console.log(`正确的多轮换班逻辑: 总飞行时间${Math.floor(totalFlightMinutes/60)}小时${totalFlightMinutes%60}分钟 ÷ ${crewCount}套机组 ÷ ${rotationRounds}轮 = 每套组每轮平均${averageHours}小时${averageRemainingMinutes}分钟`)

    // 计算换班时段
    const dutySchedule = this.calculateCorrectMultiRoundRotation(
      departure,
      arrival,
      crewCount,
      rotationRounds,
      averageMinutesPerCrewPerRound
    )

    return {
      departureTime: departure,
      flightDuration: { hours: flightHours, minutes: flightMinutes },
      crewCount,
      rotationStartAfter: { hours: 0, minutes: 0 }, // 不再使用
      rotationEndBefore: { hours: 1, minutes: 0 }, // 固定最后1小时
      rotationInterval: { hours: averageHours, minutes: averageRemainingMinutes },
      arrivalTime: arrival,
      rotationStartTime: departure, // 从起飞开始
      rotationEndTime: this.addMinutes(arrival, -60), // 着陆前1小时结束
      dutySchedule,
      restSchedule: [] // 不再计算休息时间
    }
  },

  // 计算值勤安排 - 正确的顺序轮换逻辑（考虑起飞着陆）
  calculateCorrectMultiRoundRotation(departure: Date, arrival: Date, crewCount: number, rotationRounds: number, averageMinutesPerCrewPerRound: number): DutyPeriod[] {
    const schedule: DutyPeriod[] = []
    
    console.log(`开始正确的顺序轮换计算: ${crewCount}套机组，${rotationRounds}轮，每套组每轮平均${Math.floor(averageMinutesPerCrewPerRound/60)}小时${averageMinutesPerCrewPerRound%60}分钟`)
    
    // 计算着陆前1小时的时间点
    const landingStartTime = this.addMinutes(arrival, -60) // 着陆前1小时
    
    // 创建完整的轮换序列：按照 1→2→3→4→1→2→3→4 的顺序
    const rotationSequence: number[] = []
    for (let round = 1; round <= rotationRounds; round++) {
      for (let crewIndex = 1; crewIndex <= crewCount; crewIndex++) {
        rotationSequence.push(crewIndex)
      }
    }
    
    console.log(`轮换序列: ${rotationSequence.join(' → ')} → 1(着陆)`)
    
    let currentTime = new Date(departure)
    
    // 按序列进行换班（除了最后的着陆阶段）
    for (let i = 0; i < rotationSequence.length; i++) {
      const crewIndex = rotationSequence[i]
      const currentRound = Math.floor(i / crewCount) + 1
      const positionInRound = (i % crewCount) + 1
      
      // 检查是否还有时间进行换班
      if (currentTime >= landingStartTime) {
        console.log(`时间已到着陆前1小时，停止换班`)
        break
      }
      
      // 计算本段结束时间
      let segmentEnd: Date
      
      if (i === 0 && crewIndex === 1) {
        // 第1套机组起飞：平均时间 - 1小时（预留1小时用于着陆）
        segmentEnd = this.addMinutes(currentTime, averageMinutesPerCrewPerRound - 60)
        console.log(`第1套机组起飞时间调整: 平均${Math.floor(averageMinutesPerCrewPerRound/60)}小时${averageMinutesPerCrewPerRound%60}分钟 - 1小时 = ${Math.floor((averageMinutesPerCrewPerRound-60)/60)}小时${(averageMinutesPerCrewPerRound-60)%60}分钟`)
      } else {
        // 其他机组：正常平均时间
        segmentEnd = this.addMinutes(currentTime, averageMinutesPerCrewPerRound)
      }
      
      // 确保不超过着陆前1小时
      if (segmentEnd > landingStartTime) {
        segmentEnd = landingStartTime
      }
      
      // 如果剩余时间太短（少于5分钟），就不再安排新的换班
      if (this.getMinutesFromStart(currentTime, segmentEnd) < 5) {
        console.log(`剩余时间不足5分钟，停止换班`)
        break
      }
      
      // 判断飞行阶段
      let phase: 'takeoff' | 'cruise' | 'landing' = 'cruise'
      if (i === 0) {
        phase = 'takeoff'
      }
      
      schedule.push({
        crewNumber: crewIndex,
        startTime: new Date(currentTime),
        endTime: segmentEnd,
        duration: this.getTimeDifference(currentTime, segmentEnd),
        phase: phase,
        displayStartTime: this.formatTime(currentTime),
        displayEndTime: this.formatTime(segmentEnd),
        displayDuration: this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))
      })
      
      const phaseText = phase === 'takeoff' ? '起飞' : phase === 'landing' ? '着陆' : '巡航'
      console.log(`第${crewIndex}套机组(${phaseText}-第${currentRound}轮): ${this.formatTime(currentTime)}-${this.formatTime(segmentEnd)} (${this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))})`)
      
      currentTime = segmentEnd
    }
    
    // 最后1小时：第1套机组着陆
    schedule.push({
      crewNumber: 1,
      startTime: landingStartTime,
      endTime: arrival,
      duration: this.getTimeDifference(landingStartTime, arrival),
      phase: 'landing',
      displayStartTime: this.formatTime(landingStartTime),
      displayEndTime: this.formatTime(arrival),
      displayDuration: this.formatDuration(this.getTimeDifference(landingStartTime, arrival))
    })
    
    console.log(`第1套机组(着陆): ${this.formatTime(landingStartTime)}-${this.formatTime(arrival)} (${this.formatDuration(this.getTimeDifference(landingStartTime, arrival))})`)
    
    // 验证每套机组的总工作时间
    this.validateSequentialWithLandingCrewWorkTime(schedule, crewCount, rotationRounds, averageMinutesPerCrewPerRound)
    
    return schedule
  },

  // 计算值勤安排 - 旧的多轮换班逻辑（保留作为备用）
  calculateMultiRoundRotation(departure: Date, arrival: Date, crewCount: number, rotationRounds: number, averageMinutesPerSegment: number): DutyPeriod[] {
    const schedule: DutyPeriod[] = []
    
    console.log(`开始多轮换班计算: ${crewCount}套机组，${rotationRounds}轮，每段平均${Math.floor(averageMinutesPerSegment/60)}小时${averageMinutesPerSegment%60}分钟`)
    
    // 计算着陆前1小时的时间点
    const landingStartTime = this.addMinutes(arrival, -60) // 着陆前1小时
    
    // 第1套机组：起飞阶段值班，时间为平均时间减1小时
    // 但如果平均时间少于1小时，则使用平均时间的一半
    const firstCrewDutyMinutes = averageMinutesPerSegment >= 60 ? 
      averageMinutesPerSegment - 60 : 
      Math.floor(averageMinutesPerSegment / 2)
    const firstCrewEndTime = this.addMinutes(departure, firstCrewDutyMinutes)
    
    schedule.push({
      crewNumber: 1,
      startTime: departure,
      endTime: firstCrewEndTime,
      duration: this.getTimeDifference(departure, firstCrewEndTime),
      phase: 'takeoff',
      displayStartTime: this.formatTime(departure),
      displayEndTime: this.formatTime(firstCrewEndTime),
      displayDuration: this.formatDuration(this.getTimeDifference(departure, firstCrewEndTime))
    })
    
    console.log(`第1套机组(起飞): ${this.formatTime(departure)}-${this.formatTime(firstCrewEndTime)} (${this.formatDuration(this.getTimeDifference(departure, firstCrewEndTime))})`)
    
    // 中间轮换：第2套机组开始，使用平均时间，然后继续轮换
    let currentTime = new Date(firstCrewEndTime)
    let currentCrewIndex = 2 // 从第2套机组开始
    let currentRound = 1
    
    while (currentTime < landingStartTime) {
      // 计算本段结束时间
      let segmentEnd = this.addMinutes(currentTime, averageMinutesPerSegment)
      
      // 确保不超过着陆前1小时
      if (segmentEnd > landingStartTime) {
        segmentEnd = landingStartTime
      }
      
      // 如果剩余时间太短（少于5分钟），就不再安排新的换班
      if (this.getMinutesFromStart(currentTime, segmentEnd) < 5) {
        break
      }
      
      schedule.push({
        crewNumber: currentCrewIndex,
        startTime: new Date(currentTime),
        endTime: segmentEnd,
        duration: this.getTimeDifference(currentTime, segmentEnd),
        phase: 'cruise',
        displayStartTime: this.formatTime(currentTime),
        displayEndTime: this.formatTime(segmentEnd),
        displayDuration: this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))
      })
      
      console.log(`第${currentCrewIndex}套机组(巡航-第${currentRound}轮): ${this.formatTime(currentTime)}-${this.formatTime(segmentEnd)} (${this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))})`)
      
      currentTime = segmentEnd
      
      // 更新机组索引和轮次
      currentCrewIndex++
      if (currentCrewIndex > crewCount) {
        currentCrewIndex = 2 // 重新从第2套机组开始（第1套机组负责起飞和着陆）
        currentRound++
        if (currentRound > rotationRounds) {
          break // 完成所有轮次
        }
      }
    }
    
    // 最后1小时：第一套机组重新上座值班（着陆阶段）
    schedule.push({
      crewNumber: 1,
      startTime: landingStartTime,
      endTime: arrival,
      duration: this.getTimeDifference(landingStartTime, arrival),
      phase: 'landing',
      displayStartTime: this.formatTime(landingStartTime),
      displayEndTime: this.formatTime(arrival),
      displayDuration: this.formatDuration(this.getTimeDifference(landingStartTime, arrival))
    })
    
    console.log(`第1套机组(着陆): ${this.formatTime(landingStartTime)}-${this.formatTime(arrival)} (${this.formatDuration(this.getTimeDifference(landingStartTime, arrival))})`)
    
    // 验证每套机组的总工作时间
    this.validateCrewWorkTimeMultiRound(schedule, crewCount, rotationRounds, averageMinutesPerSegment)
    
    return schedule
  },

  // 计算值勤安排 - 旧的平均分配逻辑（保留作为备用）
  calculateDutyScheduleWithEqualTime(departure: Date, arrival: Date, crewCount: number, rotationRounds: number, averageMinutesPerCrew: number): DutyPeriod[] {
    const schedule: DutyPeriod[] = []
    
    console.log(`开始平均分配换班计算: ${crewCount}套机组，每套平均${Math.floor(averageMinutesPerCrew/60)}小时${averageMinutesPerCrew%60}分钟`)
    
    // 计算着陆前1小时的时间点
    const landingStartTime = this.addMinutes(arrival, -60) // 着陆前1小时
    
    // 第一套机组：起飞阶段值班，时间为平均时间减1小时
    const firstCrewDutyMinutes = averageMinutesPerCrew - 60 // 减去1小时（因为要负责着陆）
    const firstCrewEndTime = this.addMinutes(departure, firstCrewDutyMinutes)
    
    schedule.push({
      crewNumber: 1,
      startTime: departure,
      endTime: firstCrewEndTime,
      duration: this.getTimeDifference(departure, firstCrewEndTime),
      phase: 'takeoff',
      displayStartTime: this.formatTime(departure),
      displayEndTime: this.formatTime(firstCrewEndTime),
      displayDuration: this.formatDuration(this.getTimeDifference(departure, firstCrewEndTime))
    })
    
    console.log(`第1套机组(起飞): ${this.formatTime(departure)}-${this.formatTime(firstCrewEndTime)} (${this.formatDuration(this.getTimeDifference(departure, firstCrewEndTime))})`)
    
    // 中间机组：正常轮换，支持多轮换班
    let currentTime = new Date(firstCrewEndTime)
    
    // 计算巡航阶段总时间（从第一套机组结束到着陆前1小时）
    const cruiseTotalMinutes = this.getMinutesFromStart(firstCrewEndTime, landingStartTime)
    
    // 计算每个换班段的时间（考虑轮数）
    // 总共需要安排 (crewCount - 1) * rotationRounds 个换班段
    const totalSegments = (crewCount - 1) * rotationRounds
    const segmentMinutes = Math.floor(cruiseTotalMinutes / totalSegments)
    
    console.log(`巡航阶段总时间: ${Math.floor(cruiseTotalMinutes/60)}小时${cruiseTotalMinutes%60}分钟, 分为${totalSegments}个换班段, 每段${Math.floor(segmentMinutes/60)}小时${segmentMinutes%60}分钟`)
    
    // 循环安排换班
    let segmentCount = 0
    
    // 创建机组轮换顺序数组（不包括第1套机组，因为它负责起飞和着陆）
    const crewRotationOrder: number[] = []
    for (let i = 2; i <= crewCount; i++) {
      crewRotationOrder.push(i)
    }
    
    // 如果有多轮换班，重复添加机组顺序
    for (let round = 1; round < rotationRounds; round++) {
      for (let i = 2; i <= crewCount; i++) {
        crewRotationOrder.push(i)
      }
    }
    
    console.log(`机组轮换顺序: ${crewRotationOrder.join(', ')}`)
    
    while (currentTime < landingStartTime && segmentCount < totalSegments) {
      // 从轮换顺序数组中获取当前值班的机组编号
      const crewIndex = crewRotationOrder[segmentCount]
      const currentRound = Math.floor(segmentCount / (crewCount - 1)) + 1
      
      // 计算本段结束时间
      let segmentEnd = this.addMinutes(currentTime, segmentMinutes)
      
      // 确保不超过着陆前1小时
      if (segmentEnd > landingStartTime) {
        segmentEnd = landingStartTime
      }
      
      // 如果剩余时间太短（少于5分钟），就不再安排新的换班
      if (this.getMinutesFromStart(currentTime, segmentEnd) < 5) {
        break
      }
      
      schedule.push({
        crewNumber: crewIndex,
        startTime: new Date(currentTime),
        endTime: segmentEnd,
        duration: this.getTimeDifference(currentTime, segmentEnd),
        phase: 'cruise',
        displayStartTime: this.formatTime(currentTime),
        displayEndTime: this.formatTime(segmentEnd),
        displayDuration: this.formatDuration(this.getTimeDifference(currentTime, segmentEnd)),
        roundNumber: currentRound // 添加轮次信息
      })
      
      console.log(`第${crewIndex}套机组(巡航-第${currentRound}轮): ${this.formatTime(currentTime)}-${this.formatTime(segmentEnd)} (${this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))})`)
      
      currentTime = segmentEnd
      segmentCount++
    }
    
    // 最后1小时：第一套机组重新上座值班（着陆阶段）
    schedule.push({
      crewNumber: 1,
      startTime: landingStartTime,
      endTime: arrival,
      duration: this.getTimeDifference(landingStartTime, arrival),
      phase: 'landing',
      displayStartTime: this.formatTime(landingStartTime),
      displayEndTime: this.formatTime(arrival),
      displayDuration: this.formatDuration(this.getTimeDifference(landingStartTime, arrival))
    })
    
    console.log(`第1套机组(着陆): ${this.formatTime(landingStartTime)}-${this.formatTime(arrival)} (${this.formatDuration(this.getTimeDifference(landingStartTime, arrival))})`)
    
    // 验证每套机组的总工作时间
    this.validateCrewWorkTime(schedule, crewCount, averageMinutesPerCrew)
    
    return schedule
  },
  
  // 验证每套机组的工作时间（顺序轮换+着陆）
  validateSequentialWithLandingCrewWorkTime(schedule: DutyPeriod[], crewCount: number, rotationRounds: number, averageMinutesPerCrewPerRound: number) {
    const crewWorkTime: { [key: number]: number } = {}
    
    // 初始化每套机组的工作时间
    for (let i = 1; i <= crewCount; i++) {
      crewWorkTime[i] = 0
    }
    
    // 计算每套机组的实际工作时间
    for (const duty of schedule) {
      if (duty.crewNumber > 0) { // 排除所有机组的阶段
        const durationMinutes = duty.duration.hours * 60 + duty.duration.minutes
        crewWorkTime[duty.crewNumber] = (crewWorkTime[duty.crewNumber] || 0) + durationMinutes
      }
    }
    
    // 输出验证结果
    console.log('=== 顺序轮换+着陆工作时间验证 ===')
    for (let i = 1; i <= crewCount; i++) {
      const actualMinutes = crewWorkTime[i]
      const actualHours = Math.floor(actualMinutes / 60)
      const actualRemainingMinutes = actualMinutes % 60
      
      // 第1套机组预期时间：(平均时间-1小时) + 其他轮次*平均时间 + 1小时着陆 = 平均时间*轮数
      // 其他机组预期时间：平均时间 * 轮数
      const expectedMinutes = averageMinutesPerCrewPerRound * rotationRounds
      const expectedHours = Math.floor(expectedMinutes / 60)
      const expectedRemainingMinutes = expectedMinutes % 60
      
      console.log(`第${i}套机组: 实际${actualHours}小时${actualRemainingMinutes}分钟, 预期${expectedHours}小时${expectedRemainingMinutes}分钟`)
    }
    console.log('========================')
  },

  // 验证每套机组的工作时间（顺序轮换）
  validateSequentialCrewWorkTime(schedule: DutyPeriod[], crewCount: number, rotationRounds: number, averageMinutesPerCrewPerRound: number) {
    const crewWorkTime: { [key: number]: number } = {}
    
    // 初始化每套机组的工作时间
    for (let i = 1; i <= crewCount; i++) {
      crewWorkTime[i] = 0
    }
    
    // 计算每套机组的实际工作时间
    for (const duty of schedule) {
      if (duty.crewNumber > 0) { // 排除所有机组的阶段
        const durationMinutes = duty.duration.hours * 60 + duty.duration.minutes
        crewWorkTime[duty.crewNumber] = (crewWorkTime[duty.crewNumber] || 0) + durationMinutes
      }
    }
    
    // 输出验证结果
    console.log('=== 顺序轮换工作时间验证 ===')
    for (let i = 1; i <= crewCount; i++) {
      const actualMinutes = crewWorkTime[i]
      const actualHours = Math.floor(actualMinutes / 60)
      const actualRemainingMinutes = actualMinutes % 60
      
      // 每套机组预期时间：平均时间 * 轮数
      const expectedMinutes = averageMinutesPerCrewPerRound * rotationRounds
      const expectedHours = Math.floor(expectedMinutes / 60)
      const expectedRemainingMinutes = expectedMinutes % 60
      
      console.log(`第${i}套机组: 实际${actualHours}小时${actualRemainingMinutes}分钟, 预期${expectedHours}小时${expectedRemainingMinutes}分钟`)
    }
    console.log('========================')
  },

  // 验证每套机组的工作时间（正确的多轮换班）
  validateCorrectCrewWorkTime(schedule: DutyPeriod[], crewCount: number, rotationRounds: number, averageMinutesPerCrewPerRound: number) {
    const crewWorkTime: { [key: number]: number } = {}
    
    // 初始化每套机组的工作时间
    for (let i = 1; i <= crewCount; i++) {
      crewWorkTime[i] = 0
    }
    
    // 计算每套机组的实际工作时间
    for (const duty of schedule) {
      if (duty.crewNumber > 0) { // 排除所有机组的阶段
        const durationMinutes = duty.duration.hours * 60 + duty.duration.minutes
        crewWorkTime[duty.crewNumber] = (crewWorkTime[duty.crewNumber] || 0) + durationMinutes
      }
    }
    
    // 输出验证结果
    console.log('=== 正确的多轮换班工作时间验证 ===')
    for (let i = 1; i <= crewCount; i++) {
      const actualMinutes = crewWorkTime[i]
      const actualHours = Math.floor(actualMinutes / 60)
      const actualRemainingMinutes = actualMinutes % 60
      
      // 第1套机组预期时间：起飞段（平均时间-1小时）+ 着陆段（1小时）= 平均时间
      // 其他机组预期时间：平均时间 * 轮数
      const expectedMinutes = i === 1 ? averageMinutesPerCrewPerRound : averageMinutesPerCrewPerRound * rotationRounds
      const expectedHours = Math.floor(expectedMinutes / 60)
      const expectedRemainingMinutes = expectedMinutes % 60
      
      console.log(`第${i}套机组: 实际${actualHours}小时${actualRemainingMinutes}分钟, 预期${expectedHours}小时${expectedRemainingMinutes}分钟`)
    }
    console.log('========================')
  },

  // 验证每套机组的工作时间（多轮换班）
  validateCrewWorkTimeMultiRound(schedule: DutyPeriod[], crewCount: number, rotationRounds: number, averageMinutesPerSegment: number) {
    const crewWorkTime: { [key: number]: number } = {}
    
    // 初始化每套机组的工作时间
    for (let i = 1; i <= crewCount; i++) {
      crewWorkTime[i] = 0
    }
    
    // 计算每套机组的实际工作时间
    for (const duty of schedule) {
      if (duty.crewNumber > 0) { // 排除所有机组的阶段
        const durationMinutes = duty.duration.hours * 60 + duty.duration.minutes
        crewWorkTime[duty.crewNumber] = (crewWorkTime[duty.crewNumber] || 0) + durationMinutes
      }
    }
    
    // 输出验证结果
    console.log('=== 多轮换班工作时间验证 ===')
    for (let i = 1; i <= crewCount; i++) {
      const actualMinutes = crewWorkTime[i]
      const actualHours = Math.floor(actualMinutes / 60)
      const actualRemainingMinutes = actualMinutes % 60
      
      // 第1套机组预期时间：起飞段（平均时间-1小时）+ 着陆段（1小时）= 平均时间
      // 其他机组预期时间：平均时间 * 轮数
      const expectedMinutes = i === 1 ? averageMinutesPerSegment : averageMinutesPerSegment * rotationRounds
      const expectedHours = Math.floor(expectedMinutes / 60)
      const expectedRemainingMinutes = expectedMinutes % 60
      
      console.log(`第${i}套机组: 实际${actualHours}小时${actualRemainingMinutes}分钟, 预期${expectedHours}小时${expectedRemainingMinutes}分钟`)
    }
    console.log('========================')
  },

  // 验证每套机组的工作时间是否平均（旧方法）
  validateCrewWorkTime(schedule: DutyPeriod[], crewCount: number, expectedMinutesPerCrew: number) {
    const crewWorkTime: { [key: number]: number } = {}
    
    // 初始化每套机组的工作时间
    for (let i = 1; i <= crewCount; i++) {
      crewWorkTime[i] = 0
    }
    
    // 计算每套机组的实际工作时间
    for (const duty of schedule) {
      if (duty.crewNumber > 0) { // 排除所有机组的阶段
        const durationMinutes = duty.duration.hours * 60 + duty.duration.minutes
        crewWorkTime[duty.crewNumber] = (crewWorkTime[duty.crewNumber] || 0) + durationMinutes
      }
    }
    
    // 输出验证结果
    console.log('=== 机组工作时间验证 ===')
    for (let i = 1; i <= crewCount; i++) {
      const actualMinutes = crewWorkTime[i]
      const actualHours = Math.floor(actualMinutes / 60)
      const actualRemainingMinutes = actualMinutes % 60
      const expectedHours = Math.floor(expectedMinutesPerCrew / 60)
      const expectedRemainingMinutes = expectedMinutesPerCrew % 60
      
      console.log(`第${i}套机组: 实际${actualHours}小时${actualRemainingMinutes}分钟, 预期${expectedHours}小时${expectedRemainingMinutes}分钟`)
    }
    console.log('========================')
  },





  // 工具方法：时间相加
  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000)
  },

  // 工具方法：计算时间差
  getTimeDifference(start: Date, end: Date): { hours: number, minutes: number } {
    const diffMs = end.getTime() - start.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return { hours, minutes }
  },

  // 工具方法：从起始时间计算分钟数
  getMinutesFromStart(start: Date, current: Date): number {
    return Math.floor((current.getTime() - start.getTime()) / 60000)
  },



  // 格式化时间（飞行员理解的时间格式）
  formatTime(date: Date, baseDepartureTime?: number): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    // 直接返回时间，飞行员都懂跨日期的情况
    return `${hours}:${minutes}`
  },

  // 格式化时间段
  formatDuration(duration: { hours: number, minutes: number }): string {
    return `${duration.hours}h${duration.minutes.toString().padStart(2, '0')}m`
  },

  // 获取飞行时间显示
  getFlightDurationDisplay(): string {
    return `${this.data.flightHours}小时${this.data.flightMinutes}分钟`
  },




  // 清除结果
  clearResult() {
    this.setData({
      rotationResult: null,
      showResult: false
    })
  },

  // 分享换班安排
  shareRotation() {
    if (!this.data.rotationResult) {
      wx.showToast({ title: '请先计算换班安排', icon: 'none' })
      return
    }

    const result = this.data.rotationResult
    let shareText = `长航线换班安排\n\n`
    shareText += `🛫 起飞: ${this.formatTime(result.departureTime)}\n`
    shareText += `🛬 着陆: ${this.formatTime(result.arrivalTime)}\n`
    shareText += `⏱️ 飞行时间: ${result.flightDuration.hours}小时${result.flightDuration.minutes}分钟\n`
    shareText += `👥 机组套数: ${result.crewCount}套\n`
    shareText += `🔄 换班轮数: ${this.data.rotationRounds}轮\n`
    shareText += `⚖️ 平均分配: 每套机组${result.rotationInterval.hours}小时${result.rotationInterval.minutes}分钟\n\n`
    shareText += `📋 值勤安排:\n`
    
    for (const duty of result.dutySchedule) {
      const title = duty.phase === 'takeoff' ? `第${duty.crewNumber}套机组(起飞)` : 
                   duty.phase === 'landing' ? `第${duty.crewNumber}套机组(着陆)` : 
                   `第${duty.crewNumber}套机组(巡航)`
      shareText += `${title}: ${duty.displayStartTime}-${duty.displayEndTime} (${duty.displayDuration})\n`
    }

    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showToast({
          title: '换班安排已复制',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '长航线换班计算工具',
      path: '/pages/long-flight-crew-rotation/index'
    }
  },

  onShareTimeline() {
    return {
      title: '长航线换班计算工具 - FlightToolbox'
    }
  }
}) 