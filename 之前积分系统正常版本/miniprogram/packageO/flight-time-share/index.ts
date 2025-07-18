// 分飞行时间页面

Page({
  data: {
    // 输入数据
    hours: '',
    minutes: '',
    
    // 分配模式选择
    selectedModeValue: 'ratio',
    
    // 比例选择数据
    selectedRatioValue: '5:5',
    ratioOptions: [
      { value: '1:9', display: '1:9', percent: '10% : 90%' },
      { value: '2:8', display: '2:8', percent: '20% : 80%' },
      { value: '3:7', display: '3:7', percent: '30% : 70%' },
      { value: '4:6', display: '4:6', percent: '40% : 60%' },
      { value: '5:5', display: '5:5', percent: '50% : 50%' }
    ],
    
    // 固定时间
    fixedHours: '',
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
    canCalculate: false,
    
    

  },

  onLoad() {
    this.updateCanCalculate();
    
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

  // 固定时间输入事件处理
  onFixedHoursChange(event: any) {
    const fixedHours = event.detail
    this.setData({ fixedHours }, () => {
      this.updateCanCalculate()
    })
  },

  onFixedMinutesChange(event: any) {
    const fixedMinutes = event.detail
    this.setData({ fixedMinutes }, () => {
      this.updateCanCalculate()
    })
  },

  // 模式选择
  selectMode(event: any) {
    const mode = event.currentTarget.dataset.mode
    this.setData({
      selectedModeValue: mode
    }, () => {
      this.updateCanCalculate()
    })
  },

  // 比例选择
  selectRatio(event: any) {
    const ratio = event.currentTarget.dataset.ratio
    this.setData({
      selectedRatioValue: ratio
    }, () => {
      this.updateCanCalculate()
    })
  },


  // 更新计算按钮状态
  updateCanCalculate() {
    const { hours, minutes, selectedModeValue, selectedRatioValue, fixedHours, fixedMinutes } = this.data
    const hoursNum = parseFloat(hours) || 0
    const minutesNum = parseFloat(minutes) || 0
    
    let canCalculate = false
    if (hoursNum > 0 || minutesNum > 0) {
      if (selectedModeValue === 'ratio') {
        canCalculate = selectedRatioValue !== ''
      } else if (selectedModeValue === 'fixed') {
        const fixedHoursNum = parseFloat(fixedHours) || 0
        const fixedMinutesNum = parseFloat(fixedMinutes) || 0
        canCalculate = fixedHoursNum > 0 || fixedMinutesNum > 0
      }
    }
    
    this.setData({ canCalculate })
  },

  // 计算分配
  calculateShare() {
    // 检查是否可以计算
    if (!this.data.canCalculate) {
      return
    }
    const { hours, minutes, selectedModeValue, selectedRatioValue, fixedHours, fixedMinutes } = this.data
    
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
      const fixedHoursNum = parseFloat(fixedHours) || 0
      const fixedMinutesNum = parseFloat(fixedMinutes) || 0
      
      if (fixedHoursNum < 0 || fixedMinutesNum < 0) {
        wx.showToast({
          title: '固定时间不能为负数',
          icon: 'none'
        })
        return
      }
      
      if (fixedMinutesNum >= 60) {
        wx.showToast({
          title: '固定分钟数应小于60',
          icon: 'none'
        })
        return
      }
      
      const totalFixedMinutes = fixedHoursNum * 60 + fixedMinutesNum
      
      if (totalFixedMinutes === 0) {
        wx.showToast({
          title: '请输入有效的固定时间',
          icon: 'none'
        })
        return
      }
      
      if (totalFixedMinutes >= totalMinutes) {
        wx.showToast({
          title: '固定时间不能大于等于总时间',
          icon: 'none'
        })
        return
      }
      
      person1Minutes = totalFixedMinutes
      person2Minutes = totalMinutes - person1Minutes
      person1Percentage = Math.round(person1Minutes / totalMinutes * 100)
      person2Percentage = 100 - person1Percentage
    }
    
    // 转换为小时:分钟格式
    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return `${h}:${m < 10 ? '0' + m : m}`
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
      path: '/packageO/flight-time-share/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '飞行工具箱 - 飞行时间分配工具',
      query: 'from=timeline'
    }
  },

}) 