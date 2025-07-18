/**
 * 长航线换班页面
 * 为长航线飞行提供机组换班时间计算工具
 */

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
    
    // 新增：可配置的进驾驶舱时间（默认1小时）
    landingAdvanceHours: 1,
    landingAdvanceMinutes: 0,
    
    // 选择器显示状态
    showDepartureTimePicker: false,
    showFlightDurationPicker: false,
    showLandingAdvanceTimePicker: false,
    
    // 选择器数据
    flightDurationColumns: [],
    landingAdvanceTimeColumns: [],
    
    // 计算结果
    rotationResult: null,
    showResult: false
  },

  onLoad: function() {
    this.initializeData();
    this.setupTimePickerColumns();
  },

  // 初始化数据
  initializeData: function() {
    var now = new Date();
    // 设置默认起飞时间为当前时间的时间戳
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var hoursStr = hours < 10 ? '0' + hours : '' + hours;
    var minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
    var timeString = hoursStr + ':' + minutesStr;
    
    this.setData({
      departureTime: now.getTime(),
      departureTimeValue: timeString,
      departureTimeDisplay: this.formatTime(now)
    });
  },

  // 设置时间选择器的列数据
  setupTimePickerColumns: function() {
    var self = this;
    
    // 飞行时间选择器（0-20小时，0-59分钟）
    var flightDurationColumns = [
      {
        values: Array.from ? Array.from({length: 21}, function(_, i) { return i.toString(); }) :
                (function() {
                  var arr = [];
                  for (var i = 0; i <= 20; i++) {
                    arr.push(i.toString());
                  }
                  return arr;
                })(), // 0-20小时
        defaultIndex: 8 // 默认8小时
      },
      {
        values: Array.from ? Array.from({length: 60}, function(_, i) { 
                  return i < 10 ? '0' + i : '' + i; 
                }) :
                (function() {
                  var arr = [];
                  for (var i = 0; i < 60; i++) {
                    arr.push(i < 10 ? '0' + i : '' + i);
                  }
                  return arr;
                })(), // 00-59分钟
        defaultIndex: 30 // 默认30分钟
      }
    ];

    // 进驾驶舱时间选择器（0-5小时，0-59分钟）
    var landingAdvanceTimeColumns = [
      {
        values: Array.from ? Array.from({length: 6}, function(_, i) { return i.toString(); }) :
                (function() {
                  var arr = [];
                  for (var i = 0; i <= 5; i++) {
                    arr.push(i.toString());
                  }
                  return arr;
                })(), // 0-5小时
        defaultIndex: 1 // 默认1小时
      },
      {
        values: Array.from ? Array.from({length: 60}, function(_, i) { 
                  return i < 10 ? '0' + i : '' + i; 
                }) :
                (function() {
                  var arr = [];
                  for (var i = 0; i < 60; i++) {
                    arr.push(i < 10 ? '0' + i : '' + i);
                  }
                  return arr;
                })(), // 00-59分钟
        defaultIndex: 0 // 默认0分钟
      }
    ];

    this.setData({
      flightDurationColumns: flightDurationColumns,
      landingAdvanceTimeColumns: landingAdvanceTimeColumns
    });
  },

  // 显示起飞时间选择器
  showDepartureTimePicker: function() {
    this.setData({ showDepartureTimePicker: true });
  },

  // 关闭起飞时间选择器
  closeDepartureTimePicker: function() {
    this.setData({ showDepartureTimePicker: false });
  },

  // 确认选择起飞时间
  confirmDepartureTime: function(event) {
    var timeString = event.detail; // 格式: "HH:mm"
    var timeParts = timeString.split(':');
    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);
    
    // 创建今天的日期对象，设置选择的时间
    var today = new Date();
    var selectedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    
    this.setData({
      departureTime: selectedTime.getTime(),
      departureTimeValue: timeString,
      departureTimeDisplay: this.formatTime(selectedTime),
      showDepartureTimePicker: false,
      showResult: false
    });
  },

  // 显示飞行时间选择器
  showFlightDurationPicker: function() {
    this.setData({ showFlightDurationPicker: true });
  },

  // 关闭飞行时间选择器
  closeFlightDurationPicker: function() {
    this.setData({ showFlightDurationPicker: false });
  },

  // 确认选择飞行时间
  confirmFlightDuration: function(event) {
    var selectedValue = event.detail.value;
    var hours = parseInt(selectedValue[0], 10);
    var minutes = parseInt(selectedValue[1], 10);
    
    this.setData({
      flightHours: hours,
      flightMinutes: minutes,
      showFlightDurationPicker: false,
      showResult: false
    });
  },

  // 显示进驾驶舱时间选择器
  showLandingAdvanceTimePicker: function() {
    this.setData({ showLandingAdvanceTimePicker: true });
  },

  // 关闭进驾驶舱时间选择器
  closeLandingAdvanceTimePicker: function() {
    this.setData({ showLandingAdvanceTimePicker: false });
  },

  // 确认选择进驾驶舱时间
  confirmLandingAdvanceTime: function(event) {
    var selectedValue = event.detail.value;
    var hours = parseInt(selectedValue[0], 10);
    var minutes = parseInt(selectedValue[1], 10);
    
    this.setData({
      landingAdvanceHours: hours,
      landingAdvanceMinutes: minutes,
      showLandingAdvanceTimePicker: false,
      showResult: false
    });
  },

  // 机组套数变化
  onCrewCountChange: function(event) {
    this.setData({
      crewCount: event.detail,
      showResult: false
    });
  },
  
  // 换班轮数变化
  onRotationRoundsChange: function(event) {
    this.setData({
      rotationRounds: event.detail,
      showResult: false
    });
  },

  // 🎯 基于Context7最佳实践：计算换班安排（已在进入页面时扣除3积分）
  calculateRotation: function() {
    try {
      var result = this.performRotationCalculation();
      if (result) {
        this.setData({
          rotationResult: result,
          showResult: true
        });
        
        // 显示成功提示
        wx.showToast({
          title: '计算完成',
          icon: 'success',
          duration: 1500
        });
        
        // 触觉反馈
        wx.vibrateShort({ type: 'medium' });
        
        // 滚动到结果区域
        var self = this;
        setTimeout(function() {
          wx.pageScrollTo({
            selector: '#result-section',
            duration: 500
          });
        }, 100);
      }
    } catch (error) {
      console.error('计算换班安排失败:', error);
      wx.showToast({
        title: '计算失败，请检查输入参数',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 执行换班计算
  performRotationCalculation: function() {
    var departureTime = this.data.departureTime;
    var flightHours = this.data.flightHours;
    var flightMinutes = this.data.flightMinutes;
    var crewCount = this.data.crewCount;
    var rotationRounds = this.data.rotationRounds;
    var landingAdvanceHours = this.data.landingAdvanceHours;
    var landingAdvanceMinutes = this.data.landingAdvanceMinutes;

    // 验证输入
    if (!departureTime) {
      wx.showToast({ title: '请选择起飞时间', icon: 'none' });
      return null;
    }

    var departure = new Date(departureTime);
    
    // 计算关键时间点
    var totalFlightMinutes = flightHours * 60 + flightMinutes;
    var arrival = this.addMinutes(departure, totalFlightMinutes);

    // 计算进驾驶舱的提前时间（分钟）
    var landingAdvanceMinutesTotal = landingAdvanceHours * 60 + landingAdvanceMinutes;

    // 正确的多轮换班逻辑：总飞行时间 ÷ 机组套数 ÷ 轮数 = 每套组每轮的平均时间
    var averageMinutesPerCrewPerRound = Math.floor(totalFlightMinutes / (crewCount * rotationRounds));
    var averageHours = Math.floor(averageMinutesPerCrewPerRound / 60);
    var averageRemainingMinutes = averageMinutesPerCrewPerRound % 60;

    console.log('正确的多轮换班逻辑: 总飞行时间' + Math.floor(totalFlightMinutes/60) + '小时' + (totalFlightMinutes%60) + '分钟 ÷ ' + crewCount + '套机组 ÷ ' + rotationRounds + '轮 = 每套组每轮平均' + averageHours + '小时' + averageRemainingMinutes + '分钟');

    // 计算换班时段
    var dutySchedule = this.calculateCorrectMultiRoundRotation(
      departure,
      arrival,
      crewCount,
      rotationRounds,
      averageMinutesPerCrewPerRound,
      landingAdvanceMinutesTotal
    );

    return {
      departureTime: departure,
      flightDuration: { hours: flightHours, minutes: flightMinutes },
      crewCount: crewCount,
      rotationStartAfter: { hours: 0, minutes: 0 }, // 不再使用
      rotationEndBefore: { hours: landingAdvanceHours, minutes: landingAdvanceMinutes }, // 用户配置的时间
      rotationInterval: { hours: averageHours, minutes: averageRemainingMinutes },
      arrivalTime: arrival,
      rotationStartTime: departure, // 从起飞开始
      rotationEndTime: this.addMinutes(arrival, -landingAdvanceMinutesTotal), // 着陆前自定义时间结束
      dutySchedule: dutySchedule,
      restSchedule: [] // 不再计算休息时间
    };
  },

  // 计算值勤安排 - 正确的顺序轮换逻辑（考虑起飞着陆）
  calculateCorrectMultiRoundRotation: function(departure, arrival, crewCount, rotationRounds, averageMinutesPerCrewPerRound, landingAdvanceMinutesTotal) {
    var schedule = [];
    
    console.log('开始正确的顺序轮换计算: ' + crewCount + '套机组，' + rotationRounds + '轮，每套组每轮平均' + Math.floor(averageMinutesPerCrewPerRound/60) + '小时' + (averageMinutesPerCrewPerRound%60) + '分钟');
    
    // 计算着陆前指定时间的时间点
    var landingStartTime = this.addMinutes(arrival, -landingAdvanceMinutesTotal);
    
    // 创建完整的轮换序列：按照 1→2→3→4→1→2→3→4 的顺序
    var rotationSequence = [];
    for (var round = 1; round <= rotationRounds; round++) {
      for (var crewIndex = 1; crewIndex <= crewCount; crewIndex++) {
        rotationSequence.push(crewIndex);
      }
    }
    
    console.log('轮换序列: ' + rotationSequence.join(' → ') + ' → 1(着陆)');
    
    var currentTime = new Date(departure.toString());
    
    // 按序列进行换班（除了最后的着陆阶段）
    for (var i = 0; i < rotationSequence.length; i++) {
      var crewIndex = rotationSequence[i];
      var currentRound = Math.floor(i / crewCount) + 1;
      var positionInRound = (i % crewCount) + 1;
      
      // 检查是否还有时间进行换班
      if (currentTime >= landingStartTime) {
        console.log('时间已到着陆前' + Math.floor(landingAdvanceMinutesTotal/60) + '小时' + (landingAdvanceMinutesTotal%60) + '分钟，停止换班');
        break;
      }
      
      // 计算本段结束时间
      var segmentEnd;
      
      if (i === 0 && crewIndex === 1) {
        // 第1套机组起飞：平均时间 - 用户设置的提前时间（预留该时间用于着陆）
        segmentEnd = this.addMinutes(currentTime, averageMinutesPerCrewPerRound - landingAdvanceMinutesTotal);
        console.log('第1套机组起飞时间调整: 平均' + Math.floor(averageMinutesPerCrewPerRound/60) + '小时' + (averageMinutesPerCrewPerRound%60) + '分钟 - ' + Math.floor(landingAdvanceMinutesTotal/60) + '小时' + (landingAdvanceMinutesTotal%60) + '分钟 = ' + Math.floor((averageMinutesPerCrewPerRound-landingAdvanceMinutesTotal)/60) + '小时' + ((averageMinutesPerCrewPerRound-landingAdvanceMinutesTotal)%60) + '分钟');
      } else {
        // 其他机组：正常平均时间
        segmentEnd = this.addMinutes(currentTime, averageMinutesPerCrewPerRound);
      }
      
      // 确保不超过着陆前指定时间
      if (segmentEnd > landingStartTime) {
        segmentEnd = landingStartTime;
      }
      
      // 如果剩余时间太短（少于5分钟），就不再安排新的换班
      if (this.getMinutesFromStart(currentTime, segmentEnd) < 5) {
        console.log('剩余时间不足5分钟，停止换班');
        break;
      }
      
      // 判断飞行阶段
      var phase = 'cruise';
      if (i === 0) {
        phase = 'takeoff';
      }
      
      schedule.push({
        crewNumber: crewIndex,
        startTime: new Date(currentTime.toString()),
        endTime: segmentEnd,
        duration: this.getTimeDifference(currentTime, segmentEnd),
        phase: phase,
        displayStartTime: this.formatTime(currentTime),
        displayEndTime: this.formatTime(segmentEnd),
        displayDuration: this.formatDuration(this.getTimeDifference(currentTime, segmentEnd))
      });
      
      var phaseText = phase === 'takeoff' ? '起飞' : phase === 'cruise' ? '巡航' : '着陆';
      console.log('第' + crewIndex + '套机组(' + phaseText + '-第' + currentRound + '轮): ' + this.formatTime(currentTime) + '-' + this.formatTime(segmentEnd) + ' (' + this.formatDuration(this.getTimeDifference(currentTime, segmentEnd)) + ')');
      
      currentTime = segmentEnd;
    }
    
    // 最后阶段：第1套机组着陆
    schedule.push({
      crewNumber: 1,
      startTime: landingStartTime,
      endTime: arrival,
      duration: this.getTimeDifference(landingStartTime, arrival),
      phase: 'landing',
      displayStartTime: this.formatTime(landingStartTime),
      displayEndTime: this.formatTime(arrival),
      displayDuration: this.formatDuration(this.getTimeDifference(landingStartTime, arrival))
    });
    
    console.log('第1套机组(着陆): ' + this.formatTime(landingStartTime) + '-' + this.formatTime(arrival) + ' (' + this.formatDuration(this.getTimeDifference(landingStartTime, arrival)) + ')');
    
    // 验证每套机组的总工作时间
    this.validateSequentialWithLandingCrewWorkTime(schedule, crewCount, rotationRounds, averageMinutesPerCrewPerRound);
    
    return schedule;
  },

  // 验证每套机组的工作时间（顺序轮换+着陆）
  validateSequentialWithLandingCrewWorkTime: function(schedule, crewCount, rotationRounds, averageMinutesPerCrewPerRound) {
    var crewWorkTime = {};
    
    // 初始化每套机组的工作时间
    for (var i = 1; i <= crewCount; i++) {
      crewWorkTime[i] = 0;
    }
    
    // 计算每套机组的实际工作时间
    for (var j = 0; j < schedule.length; j++) {
      var duty = schedule[j];
      if (duty.crewNumber > 0) { // 排除所有机组的阶段
        var durationMinutes = duty.duration.hours * 60 + duty.duration.minutes;
        crewWorkTime[duty.crewNumber] = (crewWorkTime[duty.crewNumber] || 0) + durationMinutes;
      }
    }
    
    // 输出验证结果
    console.log('=== 顺序轮换+着陆工作时间验证 ===');
    for (var k = 1; k <= crewCount; k++) {
      var actualMinutes = crewWorkTime[k];
      var actualHours = Math.floor(actualMinutes / 60);
      var actualRemainingMinutes = actualMinutes % 60;
      
      // 第1套机组预期时间：(平均时间-着陆提前时间) + 其他轮次*平均时间 + 着陆提前时间 = 平均时间*轮数
      // 其他机组预期时间：平均时间 * 轮数
      var expectedMinutes = averageMinutesPerCrewPerRound * rotationRounds;
      var expectedHours = Math.floor(expectedMinutes / 60);
      var expectedRemainingMinutes = expectedMinutes % 60;
      
      console.log('第' + k + '套机组: 实际' + actualHours + '小时' + actualRemainingMinutes + '分钟, 预期' + expectedHours + '小时' + expectedRemainingMinutes + '分钟');
    }
    console.log('========================');
  },

  // 工具方法：时间相加
  addMinutes: function(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  },

  // 工具方法：计算时间差
  getTimeDifference: function(start, end) {
    var diffMs = end.getTime() - start.getTime();
    var diffMinutes = Math.floor(diffMs / 60000);
    var hours = Math.floor(diffMinutes / 60);
    var minutes = diffMinutes % 60;
    return { hours: hours, minutes: minutes };
  },

  // 工具方法：从起始时间计算分钟数
  getMinutesFromStart: function(start, current) {
    return Math.floor((current.getTime() - start.getTime()) / 60000);
  },

  // 格式化时间（飞行员理解的时间格式）
  formatTime: function(date, baseDepartureTime) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var hoursStr = hours < 10 ? '0' + hours : '' + hours;
    var minutesStr = minutes < 10 ? '0' + minutes : '' + minutes;
    
    // 直接返回时间，飞行员都懂跨日期的情况
    return hoursStr + ':' + minutesStr;
  },

  // 格式化时间段
  formatDuration: function(duration) {
    var minutesStr = duration.minutes < 10 ? '0' + duration.minutes : '' + duration.minutes;
    return duration.hours + 'h' + minutesStr + 'm';
  },

  // 获取飞行时间显示
  getFlightDurationDisplay: function() {
    return this.data.flightHours + '小时' + this.data.flightMinutes + '分钟';
  },

  // 获取进驾驶舱时间显示
  getLandingAdvanceTimeDisplay: function() {
    var hours = this.data.landingAdvanceHours;
    var minutes = this.data.landingAdvanceMinutes;
    
    if (hours === 0 && minutes === 0) {
      return '立即进入驾驶舱（0分钟）';
    } else if (hours === 0) {
      return minutes + '分钟';
    } else if (minutes === 0) {
      return hours + '小时';
    } else {
      return hours + '小时' + minutes + '分钟';
    }
  },

  // 清除结果
  clearResult: function() {
    this.setData({
      rotationResult: null,
      showResult: false
    });
  },

  // 分享换班安排
  shareRotation: function() {
    if (!this.data.rotationResult) {
      wx.showToast({ title: '请先计算换班安排', icon: 'none' });
      return;
    }

    var result = this.data.rotationResult;
    var shareText = '长航线换班安排\n\n';
    shareText += '🛫 起飞: ' + this.formatTime(result.departureTime) + '\n';
    shareText += '🛬 着陆: ' + this.formatTime(result.arrivalTime) + '\n';
    shareText += '⏱️ 飞行时间: ' + result.flightDuration.hours + '小时' + result.flightDuration.minutes + '分钟\n';
    shareText += '👥 机组套数: ' + result.crewCount + '套\n';
    shareText += '🔄 换班轮数: ' + this.data.rotationRounds + '轮\n';
    shareText += '⚖️ 平均分配: 每套机组' + result.rotationInterval.hours + '小时' + result.rotationInterval.minutes + '分钟\n';
    shareText += '🕰️ 进驾驶舱时间: 着陆前' + this.getLandingAdvanceTimeDisplay() + '\n\n';
    shareText += '📋 值勤安排:\n';
    
    for (var i = 0; i < result.dutySchedule.length; i++) {
      var duty = result.dutySchedule[i];
      var title = duty.phase === 'takeoff' ? '第' + duty.crewNumber + '套机组(起飞)' : 
                 duty.phase === 'landing' ? '第' + duty.crewNumber + '套机组(着陆)' : 
                 '第' + duty.crewNumber + '套机组(巡航)';
      shareText += title + ': ' + duty.displayStartTime + '-' + duty.displayEndTime + ' (' + duty.displayDuration + ')\n';
    }

    wx.setClipboardData({
      data: shareText,
      success: function() {
        wx.showToast({
          title: '换班安排已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 页面分享
  onShareAppMessage: function() {
    return {
      title: '长航线换班计算工具',
      path: '/pages/long-flight-crew-rotation/index'
    };
  },

  onShareTimeline: function() {
    return {
      title: '长航线换班计算工具 - FlightToolbox'
    };
  }
});