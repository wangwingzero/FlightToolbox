// 分飞行时间页面
Page({
  data: {
    // 输入数据
    hours: '',
    minutes: '',
    
    // 分配模式选择
    showModeActionSheet: false,
    selectedModeValue: 'ratio',
    selectedModeDisplay: '按比例分配',
    modeActionSheetActions: [
      { name: '按比例分配', value: 'ratio' },
      { name: '固定时间分配', value: 'fixed' }
    ],
    
    // 比例选择
    showRatioActionSheet: false,
    selectedRatioValue: '5:5',
    selectedRatioDisplay: '5:5 (50%:50%)',
    ratioActionSheetActions: [
      { name: '1:9 (10%:90%)', value: '1:9' },
      { name: '2:8 (20%:80%)', value: '2:8' },
      { name: '3:7 (30%:70%)', value: '3:7' },
      { name: '4:6 (40%:60%)', value: '4:6' },
      { name: '5:5 (50%:50%)', value: '5:5' }
    ],
    
    // 固定时间
    fixedMinutes: '',
    
    // 计算结果
    showResult: false,
    totalTimeDisplay: '',
    person1TimeDisplay: '',
    person2TimeDisplay: '',
    person1Ratio: 0,
    person2Ratio: 0,
    verificationDisplay: '',
    isVerificationCorrect: false,
    
    // 计算状态
    canCalculate: false
  },

  onLoad() {
    this.updateCanCalculate()
  },

  // 输入事件处理
  onHoursChange(event: any) {
    const hours = event.detail
    this.setData({ hours }, () => {
      this.updateCanCalculate()
    })
  },

  onMinutesChange(event: any) {
    const minutes = event.detail
    this.setData({ minutes }, () => {
      this.updateCanCalculate()
    })
  },

  onFixedMinutesChange(event: any) {
    const fixedMinutes = event.detail
    this.setData({ fixedMinutes }, () => {
      this.updateCanCalculate()
    })
  },

  // 分配模式选择器事件
  showModeActionSheet() {
    this.setData({ showModeActionSheet: true })
  },

  onModeActionSheetClose() {
    this.setData({ showModeActionSheet: false })
  },

  onModeActionSheetSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.modeActionSheetActions.find(action => action.value === selectedValue)
    
    this.setData({
      selectedModeValue: selectedValue,
      selectedModeDisplay: (selectedAction && selectedAction.name) || selectedValue,
      showModeActionSheet: false
    }, () => {
      this.updateCanCalculate()
    })
  },

  // 比例选择器事件
  showRatioActionSheet() {
    this.setData({ showRatioActionSheet: true })
  },

  onRatioActionSheetClose() {
    this.setData({ showRatioActionSheet: false })
  },

  onRatioActionSheetSelect(event: any) {
    const selectedValue = event.detail.value
    const selectedAction = this.data.ratioActionSheetActions.find(action => action.value === selectedValue)
    
    this.setData({
      selectedRatioValue: selectedValue,
      selectedRatioDisplay: (selectedAction && selectedAction.name) || selectedValue,
      showRatioActionSheet: false
    }, () => {
      this.updateCanCalculate()
    })
  },

  // 更新计算按钮状态
  updateCanCalculate() {
    const { hours, minutes, selectedModeValue, selectedRatioValue, fixedMinutes } = this.data
    const hoursNum = parseFloat(hours) || 0
    const minutesNum = parseFloat(minutes) || 0
    
    let canCalculate = false
    if (hoursNum > 0 || minutesNum > 0) {
      if (selectedModeValue === 'ratio') {
        canCalculate = selectedRatioValue !== ''
      } else if (selectedModeValue === 'fixed') {
        const fixedMinutesNum = parseFloat(fixedMinutes) || 0
        canCalculate = fixedMinutesNum > 0
      }
    }
    
    this.setData({ canCalculate })
  },

  // 计算分配
  calculateShare() {
    const { hours, minutes, selectedModeValue, selectedRatioValue, fixedMinutes } = this.data
    
    // 输入验证
    const hoursNum = parseFloat(hours) || 0
    const minutesNum = parseFloat(minutes) || 0
    
    if (hoursNum < 0 || minutesNum < 0) {
      wx.showToast({
        title: '时间不能为负数',
        icon: 'none'
      })
      return
    }
    
    if (minutesNum >= 60) {
      wx.showToast({
        title: '分钟数应小于60',
        icon: 'none'
      })
      return
    }
    
    // 转换为总分钟数
    const totalMinutes = hoursNum * 60 + minutesNum
    
    if (totalMinutes === 0) {
      wx.showToast({
        title: '请输入有效的飞行时间',
        icon: 'none'
      })
      return
    }
    
    let person1Minutes = 0
    let person2Minutes = 0
    let person1Percentage = 0
    let person2Percentage = 0
    
    if (selectedModeValue === 'ratio') {
      // 按比例分配
      const [ratio1, ratio2] = selectedRatioValue.split(':').map(Number)
      const totalRatio = ratio1 + ratio2
      
      person1Minutes = Math.round(totalMinutes * ratio1 / totalRatio)
      person2Minutes = totalMinutes - person1Minutes
      person1Percentage = Math.round(ratio1 / totalRatio * 100)
      person2Percentage = 100 - person1Percentage
    } else if (selectedModeValue === 'fixed') {
      // 固定时间分配
      const fixedMinutesNum = parseFloat(fixedMinutes) || 0
      
      if (fixedMinutesNum < 0) {
        wx.showToast({
          title: '固定时间不能为负数',
          icon: 'none'
        })
        return
      }
      
      if (fixedMinutesNum >= totalMinutes) {
        wx.showToast({
          title: '固定时间不能大于等于总时间',
          icon: 'none'
        })
        return
      }
      
      person1Minutes = fixedMinutesNum
      person2Minutes = totalMinutes - fixedMinutesNum
      person1Percentage = Math.round(person1Minutes / totalMinutes * 100)
      person2Percentage = 100 - person1Percentage
    }
    
    // 转换为小时:分钟格式
    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return `${h}:${m.toString().padStart(2, '0')}`
    }
    
    // 验证计算
    const verificationMinutes = person1Minutes + person2Minutes
    const isCorrect = verificationMinutes === totalMinutes
    
    this.setData({
      showResult: true,
      totalTimeDisplay: formatTime(totalMinutes),
      person1TimeDisplay: formatTime(person1Minutes),
      person2TimeDisplay: formatTime(person2Minutes),
      person1Ratio: person1Percentage,
      person2Ratio: person2Percentage,
      verificationDisplay: formatTime(verificationMinutes),
      isVerificationCorrect: isCorrect
    })
    
    // 显示计算完成提示
    wx.showToast({
      title: '计算完成',
      icon: 'success'
    })
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '飞行工具箱 - 飞行时间分配',
      desc: '飞行时间分配工具，支持按比例和固定时间两种分配模式',
      path: '/pages/flight-time-share/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 飞行时间分配工具',
      query: 'from=timeline'
    }
  }
}) 