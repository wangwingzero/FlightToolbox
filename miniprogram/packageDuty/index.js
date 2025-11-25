/**
 * P章执勤期计算器页面
 * 使用BasePage基类，遵循ES5语法
 *
 * 📝 数据迁移说明（v2.8.0）
 * ====================================
 * 本版本已移除旧版本历史记录兼容代码（unexpectedType字段）。
 *
 * 旧版本数据格式（已废弃）:
 *   - unexpectedType: 'none' | 'before-takeoff'
 *
 * 新版本数据格式（当前使用）:
 *   - extendTwoHours: boolean（是否起飞前意外延长2小时）
 *
 * 注意：如果用户从旧版本升级，旧历史记录中的unexpectedType字段
 * 将被忽略，默认使用extendTwoHours: false。
 * ====================================
 *
 * 🔧 视觉提醒设计说明
 * ====================================
 * 当前已实现的视觉提醒：
 *   - 未到期：粉红渐变 + 脉动动画
 *   - 已到期：红色渐变 + 抖动动画 + "执勤已到期"文案
 *   - 飞行时间合规：绿色（合规）、红色（超限）
 *
 * 未实现"即将到期"分级提醒（如≤60/30/10分钟渐进式颜色变化）
 * 原因：根据用户反馈，现有"未到期/已到期"二级提醒已满足需求，
 * 过多的分级提醒可能造成干扰。
 * ====================================
 */

var BasePage = require('../utils/base-page.js');
var calculator = require('./duty-calculator.js');
var dutyData = require('./duty-data.js');

// 🔧 常量定义
var CONSTANTS = {
  MIN_REST_HOURS: 10,           // 最短休息期（小时）- 第121.495条(d)款
  COUNTDOWN_INTERVAL: 5000,     // 倒计时更新间隔（毫秒）
  UNEXPECTED_EXTENSION: 2,      // 起飞前意外延长（小时）- 第121.485条(c)款
  MAX_POSITIONING_HOURS: 10,    // 最大置位时间（小时）
  MAX_FLIGHT_HOURS: 20,         // 最大已飞/预计飞行时间（小时）
  SCROLL_TO_RESULT_DELAY: 100,  // 滚动到结果区域延迟（毫秒）
  TABLE_LOAD_DELAY: {
    TABLE_B: 100,                // 表B加载延迟（毫秒）
    TABLE_C: 200                 // 表C加载延迟（毫秒）
  }
};

// 创建页面配置
var pageConfig = {
  data: {
    // 机组类型: 'normal'(非扩编) 或 'augmented'(扩编)
    crewType: 'normal',
    
    // 报到日期和时间
    reportDate: '',  // YYYY-MM-DD格式
    reportTime: '',  // HH:mm格式
    reportDateTime: null,  // Date对象
    
    // 非扩编机组参数
    segments: 4,

    // 🆕 置位时间（非必填）- 分别存储小时和分钟
    positioningHours: 0,  // 置位小时部分
    positioningMinutes: 0,  // 置位分钟部分
    totalPositioningHours: 0,  // 置位总时间（小时，带小数）

    // 高级选项（总开关，控制所有非必填项）
    showAdvancedOptions: false,
    
    // 已飞时间（非必填）- 分别存储小时和分钟
    flownHours: 0,  // 已飞时间-小时部分
    flownMinutes: 0,  // 已飞时间-分钟部分
    totalFlownHours: 0,  // 已飞时间总计（小时，带小数）
    hasFlownTime: false,
    flownTimeDisplay: '',
    
    // 预计飞行时间（非必填）- 分别存储小时和分钟
    estimatedFlightHours: 0,  // 预计飞行时间-小时部分
    estimatedFlightMinutes: 0,  // 预计飞行时间-分钟部分
    totalEstimatedFlightTime: 0,  // 预计飞行时间总计（小时，带小数）
    hasEstimatedFlightTime: false,
    estimatedFlightTimeDisplay: '',
    
    // 最后段关车时间（非必填）
    lastShutdownDate: '',  // YYYY-MM-DD格式
    lastShutdownTime: '',  // HH:mm格式
    lastShutdownDateTime: null,  // Date对象
    earliestNextDutyTime: '',  // 最早下次执勤期开始时间 HH:mm格式
    earliestNextDutyDate: '',  // 最早下次执勤期开始日期 YYYY-MM-DD格式
    earliestNextDutyDaysOffset: 0,  // 相对关车日期的天数偏移
    
    // 扩编机组参数
    crewCount: 3,
    restFacility: 1,
    
    // 是否延长2小时选项
    extendTwoHours: false,  // false: 不延长, true: 延长2小时
    
    // 执勤期中断休息
    hasIntermediateRest: false,  // 是否中间有住宿场所休息
    restCalculationType: 'standard',  // 'standard' | 'precise' - 计算方式
    
    // 标准计算模式（快速输入休息时长）
    restDurationHours: 3,  // 休息时长-小时部分
    restDurationMinutes: 0,  // 休息时长-分钟部分
    
    // 精确计算模式（输入开始和结束时间）
    restStartTime: '',  // 休息开始时间（到达住宿场所）- HH:mm格式
    restEndTime: '',  // 休息结束时间（离开住宿场所）- HH:mm格式
    
    // 计算结果
    calculatedRestHours: 0,  // 计算出的休息时长（小时，精确小数）
    calculatedRestDisplay: '',  // 计算出的休息时长显示文本（X小时Y分钟）
    
    // 计算结果
    showResult: false,
    result: null,
    rawResult: null,  // 保存原始计算结果
    remainingFlightTime: '',
    flightTimeStatus: '',
    flightTimeExceeded: false,
    showFlightTimeStatus: false,
    latestTakeoffTime: '',
    latestTakeoffDate: '',
    latestTakeoffDaysOffset: 0,
    
    // 倒计时
    remainingTime: null,
    countdownTimer: null,
    
    // 时间选择器 - 分两步（日历+时间）
    showCalendar: false,  // 日历选择器
    showTimeOnly: false,  // 时间选择器
    selectedDateTime: null,
    // 🔧 性能优化：缩小日期范围（当前日期前后1年），减少日历初始化数据量
    minDate: Date.now() - 365 * 24 * 60 * 60 * 1000,  // 1年前
    maxDate: Date.now() + 365 * 24 * 60 * 60 * 1000,  // 1年后
    showRestDurationHoursPicker: false,  // 休息时长-小时选择器
    showRestDurationMinutesPicker: false,  // 休息时长-分钟选择器
    showRestStartTimePicker: false,  // 休息开始时间选择器（弹窗）
    showRestEndTimePicker: false,  // 休息结束时间选择器（弹窗）
    showLastShutdownCalendar: false,  // 最后段关车日历选择器
    showLastShutdownTime: false,  // 最后段关车时间选择器
    
    // 底部标签页
    // 🔧 性能优化：默认选中"累积限制"标签页，用户滚动到底部时优先展示此标签，避免加载大量法规表格数据
    activeTab: 'limits',

    // 累积限制数据
    cumulativeLimits: {},
    restRequirements: {},

    // 法规表格数据
    activeTables: ['tableA'],
    tableAData: [],
    tableBData: [],
    tableCData: []
  },

  /**
   * 自定义页面加载方法
   */
  customOnLoad: function(options) {
    console.log('📋 执勤期计算器页面加载');

    // 初始化当前日期和时间
    this.initDateTime();

    // 🔧 性能优化：移除延迟加载，改为完全按需加载
    // 累积限制数据将在用户切换到"累积限制"标签页时才加载（onTabChange）
  },

  /**
   * 页面卸载
   */
  customOnUnload: function() {
    // 清除倒计时定时器
    this.stopCountdown();
  },

  /**
   * 初始化当前日期和时间
   */
  initDateTime: function() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    
    var dateStr = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    var timeStr = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
    
    this.safeSetData({
      reportDate: dateStr,
      reportTime: timeStr,
      reportDateTime: now,
      selectedDateTime: now.getTime(),
      // 初始化休息时间为当前时间
      restStartTime: timeStr,
      restEndTime: timeStr
    });
  },

  /**
   * 初始化数据
   * 🔧 性能优化：不再在页面加载时初始化累积限制数据
   * 数据将在用户切换到"累积限制"标签页时按需加载
   */
  initData: function() {
    // 累积限制数据延迟加载，避免初始加载过大
  },

  /**
   * 初始化法规表格数据
   * 🔧 性能优化：延迟加载，仅在用户切换到"法规表格"标签页时才加载数据
   */
  initTableData: function() {
    // 不再在页面加载时初始化表格数据
    // 数据将在 onTabChange 中按需加载
  },
  
  /**
   * 按需加载法规表格数据
   * 仅在用户首次查看"法规表格"标签页时加载
   */
  loadTableDataIfNeeded: function() {
    // 检查是否已经加载过数据
    if (this.data.tableAData && this.data.tableAData.length > 0) {
      return; // 已加载，跳过
    }
    
    // 表A数据
    var tableAData = dutyData.TABLE_A.timeRanges;
    
    // 表B数据
    var tableBData = dutyData.TABLE_B.timeRanges;
    
    // 表C数据
    var tableCData = [];
    for (var i = 0; i < dutyData.TABLE_C.crewConfigs.length; i++) {
      var config = dutyData.TABLE_C.crewConfigs[i];
      tableCData.push({
        crewCount: config.crewCount,
        rest1: config.restFacilities[0].maxFDP,
        rest2: config.restFacilities[1].maxFDP,
        rest3: config.restFacilities[2].maxFDP
      });
    }
    
    // 分批次加载数据，降低单次 setData 压力
    this.safeSetData({
      tableAData: tableAData
    });

    this.createSafeTimeout(function() {
      this.safeSetData({
        tableBData: tableBData
      });
    }.bind(this), CONSTANTS.TABLE_LOAD_DELAY.TABLE_B, '加载表B数据');

    this.createSafeTimeout(function() {
      this.safeSetData({
        tableCData: tableCData
      });
    }.bind(this), CONSTANTS.TABLE_LOAD_DELAY.TABLE_C, '加载表C数据');
  },

  /**
   * 机组类型切换
   */
  onCrewTypeChange: function(event) {
    this.safeSetData({
      crewType: event.detail.name,
      showResult: false
    });
  },

  /**
   * 显示时间选择器（分两步：先日历后时间）
   */
  showDateTimePickerPopup: function() {
    // 第一步：显示日历
    this.safeSetData({
      showCalendar: true
    });
  },

  /**
   * 日历选择完成
   */
  onDateConfirm: function(event) {
    var timestamp = event.detail;
    var selectedDate = new Date(timestamp);
    
    // 保留原有的时分秒
    var currentDateTime = this.data.reportDateTime || new Date();
    selectedDate.setHours(currentDateTime.getHours());
    selectedDate.setMinutes(currentDateTime.getMinutes());
    selectedDate.setSeconds(0);
    
    // 更新日期，并进入第二步：显示时间选择器
    var year = selectedDate.getFullYear();
    var month = selectedDate.getMonth() + 1;
    var day = selectedDate.getDate();
    var dateStr = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    
    this.safeSetData({
      reportDate: dateStr,
      reportDateTime: selectedDate,
      selectedDateTime: selectedDate.getTime(),
      showCalendar: false,
      showTimeOnly: true  // 第二步：显示时间选择器
    });
  },

  /**
   * 关闭日历
   */
  closeCalendar: function() {
    this.safeSetData({
      showCalendar: false
    });
  },

  /**
   * 时间选择完成
   */
  onTimeConfirm: function(event) {
    var self = this;
    var timeStr = event.detail; // 格式 "HH:mm"
    var parts = timeStr.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    
    var dateTime = new Date(this.data.reportDateTime);
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);
    dateTime.setSeconds(0);
    
    this.safeSetData({
      reportTime: timeStr,
      reportDateTime: dateTime,
      selectedDateTime: dateTime.getTime(),
      showTimeOnly: false
    }, function() {
      // 如果高级选项已开启，自动更新预计最后关车时间
      if (self.data.showAdvancedOptions && self.data.crewType === 'normal') {
        self.calculateDefaultLastShutdownTime();
      }
    });
  },

  /**
   * 关闭时间选择器
   */
  closeTimePicker: function() {
    this.safeSetData({
      showTimeOnly: false
    });
  },

  /**
   * 计算预计飞行时间相关信息
   */
  calculateFlightTimeInfo: function(rawResult) {
    var flightTimeExceeded = false;
    var flightTimeStatus = '';
    var showFlightTimeStatus = false;
    var latestTakeoffTime = '';
    var latestTakeoffDate = '';
    var latestTakeoffDaysOffset = 0;
    
    var totalEstimatedFlightTime = this.data.totalEstimatedFlightTime;
    var totalFlownHours = this.data.totalFlownHours || 0;
    var combinedFlightTime = totalFlownHours + totalEstimatedFlightTime;
    
    if (totalEstimatedFlightTime > 0) {
      var combinedText = calculator.formatDecimalHours(combinedFlightTime);
      flightTimeExceeded = combinedFlightTime > rawResult.maxFlightTime;
      var prefix = totalFlownHours > 0 ? '已飞+预计共' : '预计共';
      flightTimeStatus = (flightTimeExceeded ? '⚠️ 超限' : '✅ 合规') + '（' + prefix + combinedText + '）';
      showFlightTimeStatus = true;
      
      if (rawResult.endDateTime) {
        var endDateTime = new Date(rawResult.endDateTime);
        var estimatedFlightMs = totalEstimatedFlightTime * 60 * 60 * 1000;
        var latestTakeoffDateTime = new Date(endDateTime.getTime() - estimatedFlightMs);
        
        var ltHours = latestTakeoffDateTime.getHours();
        var ltMinutes = latestTakeoffDateTime.getMinutes();
        latestTakeoffTime = (ltHours < 10 ? '0' : '') + ltHours + ':' + 
                           (ltMinutes < 10 ? '0' : '') + ltMinutes;
        
        var ltYear = latestTakeoffDateTime.getFullYear();
        var ltMonth = latestTakeoffDateTime.getMonth() + 1;
        var ltDay = latestTakeoffDateTime.getDate();
        latestTakeoffDate = ltYear + '-' + 
                           (ltMonth < 10 ? '0' : '') + ltMonth + '-' + 
                           (ltDay < 10 ? '0' : '') + ltDay;
        
        var reportDateTime = this.data.reportDateTime;
        if (reportDateTime) {
          var reportDateOnly = new Date(reportDateTime.getFullYear(), reportDateTime.getMonth(), reportDateTime.getDate());
          var takeoffDateOnly = new Date(latestTakeoffDateTime.getFullYear(), latestTakeoffDateTime.getMonth(), latestTakeoffDateTime.getDate());
          latestTakeoffDaysOffset = Math.round((takeoffDateOnly.getTime() - reportDateOnly.getTime()) / (24 * 60 * 60 * 1000));
        }
      }
    } else if (totalFlownHours > 0) {
      var flownText = calculator.formatDecimalHours(totalFlownHours);
      flightTimeExceeded = totalFlownHours > rawResult.maxFlightTime;
      flightTimeStatus = (flightTimeExceeded ? '⚠️ 超限' : '✅ 合规') + '（已飞共' + flownText + '）';
      showFlightTimeStatus = true;
    }
    
    return {
      flightTimeExceeded: flightTimeExceeded,
      flightTimeStatus: flightTimeStatus,
      showFlightTimeStatus: showFlightTimeStatus,
      latestTakeoffTime: latestTakeoffTime,
      latestTakeoffDate: latestTakeoffDate,
      latestTakeoffDaysOffset: latestTakeoffDaysOffset,
      totalEstimatedFlightTime: totalEstimatedFlightTime
    };
  },

  /**
   * 航段数变化
   */
  onSegmentsChange: function(event) {
    var self = this;
    this.safeSetData({
      segments: event.detail
    }, function() {
      // 如果高级选项已开启，自动更新预计最后关车时间
      if (self.data.showAdvancedOptions && self.data.crewType === 'normal') {
        self.calculateDefaultLastShutdownTime();
      }
    });
  },

  /**
   * 置位时间-小时输入
   */
  onPositioningHoursInput: function(event) {
    var hours = parseInt(event.detail.value, 10) || 0;
    if (hours < 0) hours = 0;
    if (hours > CONSTANTS.MAX_POSITIONING_HOURS) hours = CONSTANTS.MAX_POSITIONING_HOURS;

    this.updatePositioningTime(hours, this.data.positioningMinutes);
  },

  /**
   * 置位时间-分钟输入
   */
  onPositioningMinutesInput: function(event) {
    var minutes = parseInt(event.detail.value, 10) || 0;
    if (minutes < 0) minutes = 0;
    if (minutes > 59) minutes = 59;

    this.updatePositioningTime(this.data.positioningHours, minutes);
  },

  /**
   * 更新置位时间
   */
  updatePositioningTime: function(hours, minutes) {
    var totalHours = hours + minutes / 60;

    this.safeSetData({
      positioningHours: hours,
      positioningMinutes: minutes,
      totalPositioningHours: totalHours
    });
  },

  /**
   * 已飞时间-小时输入
   */
  onFlownHoursInput: function(event) {
    var hours = parseInt(event.detail.value, 10) || 0;
    if (hours < 0) hours = 0;
    if (hours > CONSTANTS.MAX_FLIGHT_HOURS) hours = CONSTANTS.MAX_FLIGHT_HOURS;

    this.updateFlownTime(hours, this.data.flownMinutes);
  },

  /**
   * 已飞时间-分钟输入
   */
  onFlownMinutesInput: function(event) {
    var minutes = parseInt(event.detail.value, 10) || 0;
    if (minutes < 0) minutes = 0;
    if (minutes > 59) minutes = 59;

    this.updateFlownTime(this.data.flownHours, minutes);
  },
  updateFlownTime: function(hours, minutes) {
    var totalHours = hours + minutes / 60;
    var hasFlownTime = totalHours > 0;
    var displayText = '';

    if (hasFlownTime) {
      displayText = this.formatHoursMinutes(hours, minutes);
    }

    this.safeSetData({
      flownHours: hours,
      flownMinutes: minutes,
      totalFlownHours: totalHours,
      hasFlownTime: hasFlownTime,
      flownTimeDisplay: displayText
    });
  },


  /**
   * 预计飞行时间-小时输入
   */
  onEstimatedFlightHoursInput: function(event) {
    var hours = parseInt(event.detail.value, 10) || 0;
    if (hours < 0) hours = 0;
    if (hours > CONSTANTS.MAX_FLIGHT_HOURS) hours = CONSTANTS.MAX_FLIGHT_HOURS;

    this.updateEstimatedFlightTime(hours, this.data.estimatedFlightMinutes);
  },

  /**
   * 预计飞行时间-分钟输入
   */
  onEstimatedFlightMinutesInput: function(event) {
    var minutes = parseInt(event.detail.value, 10) || 0;
    if (minutes < 0) minutes = 0;
    if (minutes > 59) minutes = 59;
    
    this.updateEstimatedFlightTime(this.data.estimatedFlightHours, minutes);
  },
  updateEstimatedFlightTime: function(hours, minutes) {
    var totalHours = hours + minutes / 60;
    var hasEstimated = totalHours > 0;
    var displayText = '';

    if (hasEstimated) {
      displayText = this.formatHoursMinutes(hours, minutes);
    }

    this.safeSetData({
      estimatedFlightHours: hours,
      estimatedFlightMinutes: minutes,
      totalEstimatedFlightTime: totalHours,
      hasEstimatedFlightTime: hasEstimated,
      estimatedFlightTimeDisplay: displayText
    });
  },

  formatHoursMinutes: function(hours, minutes) {
    if (hours > 0 && minutes > 0) {
      return hours + '小时' + minutes + '分钟';
    } else if (hours > 0) {
      return hours + '小时';
    } else if (minutes > 0) {
      return minutes + '分钟';
    }
    return '';
  },

  /**
   * 选择意外情况类型（按钮切换）
   */
  toggleExtendTwoHours: function(event) {
    var value = event.currentTarget.dataset.value === 'true';
    this.safeSetData({
      extendTwoHours: value
    });
  },

  /**
   * 中断休息开关变化
   */
  onIntermediateRestChange: function(event) {
    this.safeSetData({
      hasIntermediateRest: event.detail
    });
  },

  /**
   * 高级选项开关变化（控制所有非必填项）
   */
  onAdvancedOptionsToggle: function(event) {
    var self = this;
    var showAdvanced = event.detail;
    
    this.safeSetData({
      showAdvancedOptions: showAdvanced
    });
    
    // 如果打开高级选项且是非扩编机组，自动计算预计最后关车时间的默认值
    if (showAdvanced && this.data.crewType === 'normal' && this.data.reportDateTime && this.data.segments) {
      this.calculateDefaultLastShutdownTime();
    }
  },
  
  /**
   * 计算预计最后段关车时间的默认值
   * 基于报到时间 + 最大飞行执勤期
   */
  calculateDefaultLastShutdownTime: function() {
    var self = this;
    
    // 获取报到时间和航段数
    var reportTime = this.data.reportTime;
    var segments = this.data.segments;
    var reportDateTime = this.data.reportDateTime;
    
    if (!reportTime || !segments || !reportDateTime) {
      return;
    }
    
    // 查询最大飞行执勤期
    var fdpResult = calculator.getMaxFDPFromTableB(reportTime, segments);
    if (!fdpResult) {
      return;
    }
    
    // 计算预计最后关车时间 = 报到时间 + 最大飞行执勤期
    var maxFDPHours = fdpResult.maxFDP;
    var shutdownDateTime = new Date(reportDateTime);
    shutdownDateTime.setMinutes(shutdownDateTime.getMinutes() + Math.round(maxFDPHours * 60));
    
    // 格式化日期和时间
    var year = shutdownDateTime.getFullYear();
    var month = String(shutdownDateTime.getMonth() + 1).padStart(2, '0');
    var day = String(shutdownDateTime.getDate()).padStart(2, '0');
    var hours = String(shutdownDateTime.getHours()).padStart(2, '0');
    var minutes = String(shutdownDateTime.getMinutes()).padStart(2, '0');
    
    var lastShutdownDate = year + '-' + month + '-' + day;
    var lastShutdownTime = hours + ':' + minutes;
    
    // 自动更新预计最后关车时间（每次都更新，让用户看到最新计算值）
    this.safeSetData({
      lastShutdownDate: lastShutdownDate,
      lastShutdownTime: lastShutdownTime,
      lastShutdownDateTime: shutdownDateTime
    });
  },

  /**
   * 选择休息计算方式（按钮切换）
   */
  selectRestCalculationType: function(event) {
    var value = event.currentTarget.dataset.value;
    this.safeSetData({
      restCalculationType: value
    });
  },

  /**
   * 休息时长-小时输入
   */
  onRestDurationHoursInput: function(event) {
    var self = this;
    var hours = parseInt(event.detail.value, 10) || 0;
    // 限制小时范围 0-10
    if (hours < 0) hours = 0;
    if (hours > 10) hours = 10;
    
    this.safeSetData({
      restDurationHours: hours
    }, function() {
      self.calculateStandardRestDuration();
    });
  },

  /**
   * 休息时长-分钟输入
   */
  onRestDurationMinutesInput: function(event) {
    var self = this;
    var minutes = parseInt(event.detail.value, 10) || 0;
    // 限制分钟范围 0-59
    if (minutes < 0) minutes = 0;
    if (minutes > 59) minutes = 59;
    
    this.safeSetData({
      restDurationMinutes: minutes
    }, function() {
      self.calculateStandardRestDuration();
    });
  },

  /**
   * 计算标准模式的休息时长
   */
  calculateStandardRestDuration: function() {
    var hours = this.data.restDurationHours;
    var minutes = this.data.restDurationMinutes;
    
    var totalHours = hours + minutes / 60;
    var displayText = hours + '小时' + minutes + '分钟';
    
    this.safeSetData({
      calculatedRestHours: totalHours,
      calculatedRestDisplay: displayText
    });
  },

  /**
   * 显示休息开始时间选择器
   */
  showRestStartTimePicker: function() {
    this.safeSetData({
      showRestStartTimePicker: true
    });
  },

  /**
   * 关闭休息开始时间选择器
   */
  closeRestStartTimePicker: function() {
    this.safeSetData({
      showRestStartTimePicker: false
    });
  },

  /**
   * 确认休息开始时间
   */
  onRestStartTimeConfirm: function(event) {
    var self = this;
    var restStartTime = event.detail;
    this.safeSetData({
      restStartTime: restStartTime,
      showRestStartTimePicker: false
    }, function() {
      // 如果两个时间都已选择，计算时长
      self.calculatePreciseRestDuration();
    });
  },

  /**
   * 显示休息结束时间选择器
   */
  showRestEndTimePicker: function() {
    this.safeSetData({
      showRestEndTimePicker: true
    });
  },

  /**
   * 关闭休息结束时间选择器
   */
  closeRestEndTimePicker: function() {
    this.safeSetData({
      showRestEndTimePicker: false
    });
  },

  /**
   * 确认休息结束时间
   */
  onRestEndTimeConfirm: function(event) {
    var self = this;
    var restEndTime = event.detail;
    this.safeSetData({
      restEndTime: restEndTime,
      showRestEndTimePicker: false
    }, function() {
      // 如果两个时间都已选择，计算时长
      self.calculatePreciseRestDuration();
    });
  },

  /**
   * 计算精确模式的休息时长
   */
  calculatePreciseRestDuration: function() {
    var restStartTime = this.data.restStartTime;
    var restEndTime = this.data.restEndTime;
    
    // 确保时间值存在且为字符串
    if (!restStartTime || !restEndTime || typeof restStartTime !== 'string' || typeof restEndTime !== 'string') {
      return;
    }
    
    // 解析时间（格式：HH:mm）
    var startParts = restStartTime.split(':');
    var endParts = restEndTime.split(':');
    
    var startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    var endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
    
    // 如果结束时间小于等于开始时间，说明跨天了
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    var durationMinutes = endMinutes - startMinutes;
    var durationHours = durationMinutes / 60;
    
    // 验证休息时长合理性
    if (durationHours < 0.5 || durationHours > 24) {
      return; // 静默处理，不弹提示
    }
    
    // 格式化显示文本
    var hours = Math.floor(durationMinutes / 60);
    var minutes = durationMinutes % 60;
    var displayText = hours + '小时' + minutes + '分钟';
    
    this.safeSetData({
      calculatedRestHours: durationHours,
      calculatedRestDisplay: displayText
    });
  },

  /**
   * 打开最后段关车时间选择器（第一步：日历）
   */
  showLastShutdownPicker: function() {
    this.safeSetData({
      showLastShutdownCalendar: true
    });
  },

  /**
   * 关闭最后段关车日历
   */
  closeLastShutdownCalendar: function() {
    this.safeSetData({
      showLastShutdownCalendar: false
    });
  },

  /**
   * 确认最后段关车日期（第一步）
   */
  onLastShutdownDateConfirm: function(event) {
    var selectedDate = new Date(event.detail);
    var year = selectedDate.getFullYear();
    var month = selectedDate.getMonth() + 1;
    var day = selectedDate.getDate();
    var dateStr = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
    
    // 保存日期并进入时间选择
    this.safeSetData({
      lastShutdownDate: dateStr,
      showLastShutdownCalendar: false,
      showLastShutdownTime: true  // 显示时间选择器
    });
  },

  /**
   * 关闭最后段关车时间选择器
   */
  closeLastShutdownTimePicker: function() {
    this.safeSetData({
      showLastShutdownTime: false
    });
  },

  /**
   * 确认最后段关车时间（第二步）
   */
  onLastShutdownTimeConfirm: function(event) {
    var self = this;
    var timeStr = event.detail;
    
    // 创建DateTime对象
    var dateTimeParts = this.data.lastShutdownDate.split('-');
    var timeParts = timeStr.split(':');
    var dateTime = new Date(
      parseInt(dateTimeParts[0], 10),
      parseInt(dateTimeParts[1], 10) - 1,
      parseInt(dateTimeParts[2], 10),
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10)
    );
    
    this.safeSetData({
      lastShutdownTime: timeStr,
      lastShutdownDateTime: dateTime,
      showLastShutdownTime: false
    }, function() {
      // 计算最早下次执勤期开始时间
      self.calculateEarliestNextDuty();
    });
  },

  /**
   * 计算最早下次执勤期开始时间
   * 根据CCAR-121 第121.495条(d)款：最短休息期为10小时
   * 🆕 考虑置位时间：置位占用休息期，延后休息期开始时间
   */
  calculateEarliestNextDuty: function() {
    var lastShutdownDateTime = this.data.lastShutdownDateTime;

    if (!lastShutdownDateTime) {
      return;
    }

    // 🆕 获取置位时间（小时，小数）
    var positioningHours = this.data.totalPositioningHours || 0;

    // 计算休息期开始时间 = 关车时间 + 置位时间
    var restStartDateTime = new Date(lastShutdownDateTime.getTime() + positioningHours * 60 * 60 * 1000);

    // 加上最短休息期（CONSTANTS.MIN_REST_HOURS）
    var earliestNextDutyDateTime = new Date(restStartDateTime.getTime() + CONSTANTS.MIN_REST_HOURS * 60 * 60 * 1000);

    // 格式化时间
    var hours = earliestNextDutyDateTime.getHours();
    var minutes = earliestNextDutyDateTime.getMinutes();
    var timeStr = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

    // 格式化日期
    var year = earliestNextDutyDateTime.getFullYear();
    var month = earliestNextDutyDateTime.getMonth() + 1;
    var day = earliestNextDutyDateTime.getDate();
    var dateStr = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;

    // 计算天数偏移
    var shutdownDateOnly = new Date(lastShutdownDateTime.getFullYear(), lastShutdownDateTime.getMonth(), lastShutdownDateTime.getDate());
    var nextDutyDateOnly = new Date(earliestNextDutyDateTime.getFullYear(), earliestNextDutyDateTime.getMonth(), earliestNextDutyDateTime.getDate());
    var daysOffset = Math.round((nextDutyDateOnly.getTime() - shutdownDateOnly.getTime()) / (24 * 60 * 60 * 1000));

    this.safeSetData({
      earliestNextDutyTime: timeStr,
      earliestNextDutyDate: dateStr,
      earliestNextDutyDaysOffset: daysOffset
    });
  },

  /**
   * 飞行员数量变化
   */
  onCrewCountChange: function(event) {
    this.safeSetData({
      crewCount: parseInt(event.detail, 10)
    });
  },

  /**
   * 选择飞行员数量
   */
  selectCrewCount: function(event) {
    var value = parseInt(event.currentTarget.dataset.value, 10);
    this.safeSetData({
      crewCount: value
    });
  },

  /**
   * 休息设施等级变化
   */
  onRestFacilityChange: function(event) {
    this.safeSetData({
      restFacility: parseInt(event.detail, 10)
    });
  },

  /**
   * 选择休息设施等级
   */
  selectRestFacility: function(event) {
    var value = parseInt(event.currentTarget.dataset.value, 10);
    this.safeSetData({
      restFacility: value
    });
  },

  /**
   * 获取置位时间默认状态
   * @returns {object} 置位时间默认值
   */
  getDefaultPositioningState: function() {
    return {
      positioningHours: 0,
      positioningMinutes: 0,
      totalPositioningHours: 0
    };
  },

  /**
   * 获取公共清空状态
   * 🔧 代码优化：提取公共逻辑，减少代码重复
   * @returns {object} 公共清空状态
   */
  getCommonClearState: function() {
    // 初始化当前日期和时间
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    var dateStr = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    var timeStr = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);

    // 获取置位时间默认状态
    var defaultPositioning = this.getDefaultPositioningState();

    return {
      reportDate: dateStr,
      reportTime: timeStr,
      reportDateTime: now,
      selectedDateTime: now.getTime(),
      showAdvancedOptions: false,
      positioningHours: defaultPositioning.positioningHours,
      positioningMinutes: defaultPositioning.positioningMinutes,
      totalPositioningHours: defaultPositioning.totalPositioningHours,
      flownHours: 0,
      flownMinutes: 0,
      estimatedFlightHours: 0,
      estimatedFlightMinutes: 0,
      lastShutdownDate: '',
      lastShutdownTime: '',
      lastShutdownDateTime: null,
      earliestNextDutyTime: '',
      earliestNextDutyDate: '',
      earliestNextDutyDaysOffset: 0,
      extendTwoHours: false,
      hasIntermediateRest: false,
      restCalculationType: 'standard',
      restDurationHours: 3,
      restDurationMinutes: 0,
      restStartTime: timeStr,
      restEndTime: timeStr,
      calculatedRestHours: 0,
      calculatedRestDisplay: '',
      hasFlownTime: false,
      flownTimeDisplay: '',
      totalFlownHours: 0,
      hasEstimatedFlightTime: false,
      estimatedFlightTimeDisplay: '',
      totalEstimatedFlightTime: 0,
      showResult: false,
      result: null,
      rawResult: null,
      remainingTime: null,
      remainingFlightTime: '',
      flightTimeStatus: '',
      flightTimeExceeded: false,
      showFlightTimeStatus: false,
      latestTakeoffTime: '',
      latestTakeoffDate: '',
      latestTakeoffDaysOffset: 0
    };
  },

  /**
   * 滚动到结果区域
   * 🔧 性能优化：提取公共函数，避免代码重复
   */
  scrollToResult: function() {
    this.createSafeTimeout(function() {
      wx.pageScrollTo({
        selector: '.result-section',
        duration: 300
      });
    }, CONSTANTS.SCROLL_TO_RESULT_DELAY, '滚动到结果');
  },

  /**
   * 计算非扩编机组限制
   */
  calculateNormal: function() {
    var self = this;
    var reportTime = this.data.reportTime;
    var reportDate = this.data.reportDate;
    var segments = this.data.segments;

    // 验证输入
    var validation = calculator.validateNormalCrewInput(reportTime, segments);
    if (!validation.valid) {
      this.handleError({ message: validation.error }, '输入验证');
      return;
    }

    // 获取休息时长（根据计算方式选择）
    var actualRestHours = 0;
    if (this.data.hasIntermediateRest) {
      if (this.data.restCalculationType === 'standard') {
        // 标准计算：直接使用小时和分钟
        actualRestHours = this.data.restDurationHours + this.data.restDurationMinutes / 60;
      } else {
        // 精确计算：使用计算出的休息时长
        actualRestHours = this.data.calculatedRestHours;
        if (!actualRestHours || actualRestHours <= 0) {
          this.handleError({ message: '请输入休息开始和结束时间' }, '输入验证');
          return;
        }
      }
    }
    
    // 计算限制（传入意外类型和中断休息参数，直接计算延长后的值）
    // 将 extendTwoHours 转换为 unexpectedType 格式: false -> 'none', true -> 'before-takeoff'
    var unexpectedType = this.data.extendTwoHours ? 'before-takeoff' : 'none';
    var rawResult = calculator.calculateNormalCrew(
      reportTime,
      segments,
      reportDate,
      unexpectedType,
      this.data.hasIntermediateRest,
      actualRestHours,
      this.data.totalPositioningHours  // 🆕 置位时间
    );
    
    if (!rawResult.success) {
      this.handleError({ message: rawResult.error }, '计算失败');
      return;
    }
    
    // 格式化结果
    var formattedResult = calculator.formatResult(rawResult);
    
    // 计算剩余飞行时间（如果输入了已飞时间）
    var remainingFlightTime = '';
    var totalFlownHours = this.data.flownHours + (this.data.flownMinutes / 60);
    if (totalFlownHours > 0) {
      var remaining = rawResult.maxFlightTime - totalFlownHours;
      remainingFlightTime = remaining > 0 ? remaining.toFixed(1) : '0';
    }
    
    // 计算预计飞行时间相关信息
    var flightTimeInfo = this.calculateFlightTimeInfo(rawResult);
    
    // 显示结果
    this.safeSetData({
      showResult: true,
      result: formattedResult,
      rawResult: rawResult,
      remainingFlightTime: remainingFlightTime,
      flightTimeExceeded: flightTimeInfo.flightTimeExceeded,
      flightTimeStatus: flightTimeInfo.flightTimeStatus,
      showFlightTimeStatus: flightTimeInfo.showFlightTimeStatus,
      latestTakeoffTime: flightTimeInfo.latestTakeoffTime,
      latestTakeoffDate: flightTimeInfo.latestTakeoffDate,
      latestTakeoffDaysOffset: flightTimeInfo.latestTakeoffDaysOffset,
      totalEstimatedFlightTime: flightTimeInfo.totalEstimatedFlightTime,
      hasEstimatedFlightTime: this.data.hasEstimatedFlightTime,
      estimatedFlightTimeDisplay: this.data.estimatedFlightTimeDisplay,
      hasFlownTime: this.data.hasFlownTime,
      flownTimeDisplay: this.data.flownTimeDisplay
    });
    
    // 启动倒计时
    if (rawResult.endDateTime) {
      this.startCountdown(rawResult.endDateTime);
    }

    // 滚动到结果区域
    this.scrollToResult();
  },

  /**
   * 计算扩编机组限制
   */
  calculateAugmented: function() {
    var self = this;
    var crewCount = this.data.crewCount;
    var restFacility = this.data.restFacility;
    var reportTime = this.data.reportTime;
    var reportDate = this.data.reportDate;

    // 验证输入
    var validation = calculator.validateAugmentedCrewInput(crewCount, restFacility);
    if (!validation.valid) {
      this.handleError({ message: validation.error }, '输入验证');
      return;
    }

    // 获取休息时长（根据计算方式选择）
    var actualRestHours = 0;
    if (this.data.hasIntermediateRest) {
      if (this.data.restCalculationType === 'standard') {
        // 标准计算：直接使用小时和分钟
        actualRestHours = this.data.restDurationHours + this.data.restDurationMinutes / 60;
      } else {
        // 精确计算：使用计算出的休息时长
        actualRestHours = this.data.calculatedRestHours;
        if (!actualRestHours || actualRestHours <= 0) {
          this.handleError({ message: '请输入休息开始和结束时间' }, '输入验证');
          return;
        }
      }
    }
    
    // 计算限制（传入意外类型和中断休息参数，直接计算延长后的值）
    // 将 extendTwoHours 转换为 unexpectedType 格式: false -> 'none', true -> 'before-takeoff'
    var unexpectedType = this.data.extendTwoHours ? 'before-takeoff' : 'none';
    var rawResult = calculator.calculateAugmentedCrew(
      crewCount,
      restFacility,
      reportTime,
      reportDate,
      unexpectedType,
      this.data.hasIntermediateRest,
      actualRestHours,
      this.data.totalPositioningHours  // 🆕 置位时间
    );
    
    if (!rawResult.success) {
      this.handleError({ message: rawResult.error }, '计算失败');
      return;
    }
    
    // 格式化结果
    var formattedResult = calculator.formatResult(rawResult);
    
    // 计算剩余飞行时间（如果输入了已飞时间）
    var remainingFlightTime = '';
    var totalFlownHours = this.data.flownHours + (this.data.flownMinutes / 60);
    if (totalFlownHours > 0) {
      var remaining = rawResult.maxFlightTime - totalFlownHours;
      remainingFlightTime = remaining > 0 ? remaining.toFixed(1) : '0';
    }
    
    // 计算预计飞行时间相关信息
    var flightTimeInfo = this.calculateFlightTimeInfo(rawResult);
    
    // 显示结果
    this.safeSetData({
      showResult: true,
      result: formattedResult,
      rawResult: rawResult,
      remainingFlightTime: remainingFlightTime,
      flightTimeExceeded: flightTimeInfo.flightTimeExceeded,
      flightTimeStatus: flightTimeInfo.flightTimeStatus,
      showFlightTimeStatus: flightTimeInfo.showFlightTimeStatus,
      latestTakeoffTime: flightTimeInfo.latestTakeoffTime,
      latestTakeoffDate: flightTimeInfo.latestTakeoffDate,
      latestTakeoffDaysOffset: flightTimeInfo.latestTakeoffDaysOffset,
      totalEstimatedFlightTime: flightTimeInfo.totalEstimatedFlightTime,
      hasEstimatedFlightTime: this.data.hasEstimatedFlightTime,
      estimatedFlightTimeDisplay: this.data.estimatedFlightTimeDisplay,
      hasFlownTime: this.data.hasFlownTime,
      flownTimeDisplay: this.data.flownTimeDisplay
    });
    
    // 启动倒计时
    if (rawResult.endDateTime) {
      this.startCountdown(rawResult.endDateTime);
    }

    // 滚动到结果区域
    this.scrollToResult();
  },

  /**
   * 清空非扩编机组输入
   */
  clearNormalInputs: function() {
    var self = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有输入并重置到默认状态吗？',
      confirmText: '清空',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          // 获取公共清空状态
          var commonState = self.getCommonClearState();

          // 添加非扩编机组特有字段
          commonState.segments = 4;

          // 重置所有输入到默认值
          self.safeSetData(commonState);

          // 停止倒计时
          self.stopCountdown();

          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  /**
   * 清空扩编机组输入
   */
  clearAugmentedInputs: function() {
    var self = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有输入并重置到默认状态吗？',
      confirmText: '清空',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          // 获取公共清空状态
          var commonState = self.getCommonClearState();

          // 添加扩编机组特有字段
          commonState.crewCount = 3;
          commonState.restFacility = 1;

          // 重置所有输入到默认值
          self.safeSetData(commonState);

          // 停止倒计时
          self.stopCountdown();

          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  /**
   * 底部标签页切换
   * 🔧 性能优化：按需加载法规表格数据和累积限制数据
   */
  onTabChange: function(event) {
    var tabName = event.detail.name;

    this.safeSetData({
      activeTab: tabName
    });

    // 如果切换到"法规表格"标签页，按需加载数据
    if (tabName === 'tables') {
      this.loadTableDataIfNeeded();
    }

    // 如果切换到"累积限制"标签页，按需加载数据
    if (tabName === 'limits') {
      this.loadLimitsDataIfNeeded();
    }
  },

  /**
   * 按需加载累积限制数据
   * 仅在用户首次查看"累积限制"标签页时加载
   */
  loadLimitsDataIfNeeded: function() {
    // 检查是否已经加载过数据
    if (this.data.cumulativeLimits && Object.keys(this.data.cumulativeLimits).length > 0) {
      return; // 已加载，跳过
    }

    // 加载累积限制数据
    var limits = calculator.getCumulativeLimits();
    var rest = calculator.getRestRequirements();

    this.safeSetData({
      cumulativeLimits: limits,
      restRequirements: rest
    });
  },

  /**
   * 法规表格折叠面板变化
   */
  onTableCollapse: function(event) {
    this.safeSetData({
      activeTables: event.detail
    });
  },

  /**
   * 启动倒计时
   * 🔧 性能优化：降低更新频率，避免 setData 队列溢出
   */
  startCountdown: function(endDateTime) {
    var self = this;

    // 停止之前的倒计时
    this.stopCountdown();

    // 立即更新一次
    this.updateCountdown(endDateTime);

    // 🔧 性能优化：使用常量定义的更新间隔，避免频繁 setData 导致队列溢出
    // 对于倒计时功能，5 秒的精度已经足够，用户体验不会明显下降
    var timer = this.createSafeInterval(function() {
      self.updateCountdown(endDateTime);
    }, CONSTANTS.COUNTDOWN_INTERVAL, '倒计时更新');
    
    this.safeSetData({
      countdownTimer: timer
    });
  },

  /**
   * 停止倒计时
   */
  stopCountdown: function() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.safeSetData({
        countdownTimer: null,
        remainingTime: null
      });
    }
  },

  /**
   * 更新倒计时
   */
  updateCountdown: function(endDateTime) {
    var remaining = calculator.calculateRemainingTime(endDateTime);
    this.safeSetData({
      remainingTime: remaining
    });
  },

  // 转发功能
  onShareAppMessage: function() {
    return {
      title: '执勤期计算器 - P章值勤期限制查询',
      desc: '快速查询飞行机组值勤期限制和飞行时间限制',
      path: '/packageDuty/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '执勤期计算器 - P章法规查询',
      path: '/packageDuty/index'
    };
  }
};

// 使用BasePage创建页面
Page(BasePage.createPage(pageConfig));

