import { getEventTypeById } from '../../services/event.data';
import { EventType } from '../../services/event.types';
import { StorageService } from '../../services/storage.service';
import { ReportBuilder } from '../../services/report.builder';

Page({
  data: {
    eventType: null as EventType | null,
    formData: {} as { [key: string]: any },
    showDatePicker: false,
    selectedDate: new Date().getTime(),
    selectedHour: new Date().getHours(),
    selectedMinute: Math.floor(new Date().getMinutes() / 5),
    hourRange: Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')),
    minuteRange: Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, '0')),
    currentFieldId: '',
    customDeadline: '',
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date().getTime(),
    // 新增数据
    completedFields: 0,
    totalFields: 0,
    progressPercentage: 0,
    canSubmit: false,
    showValidationDialog: false,
    validationMessage: '',
    // 字段示例数据
    fieldPlaceholders: {
      // 基本信息字段
      'aircraftModel': 'B737-800',
      'eventTime': '2024-03-15 14:30',
      'flightInfo': 'CA1234',
      'flightNumber': 'MU5678',
      'route': '北京首都-上海浦东',
      'name': '张伟',
      'company': '中国国际航空股份有限公司',
      'position': '机长',
      'licenseNumber': 'ATPL-20240315001',
      'phone': '13812345678',
      'email': 'zhangwei@airchina.com',
      
      // 位置和环境
      'location': '北京首都机场T3航站楼32L跑道',
      'altitude': 'FL350（10668米）',
      'position': '距离首都机场东南方向25海里',
      'weather': '多云，能见度8公里，风向270度，风速15节',
      'phase': '巡航阶段',
      'controlArea': '北京区域管制中心',
      
      // 事件描述类
      'description': '14:30左右，航班在FL350巡航过程中遭遇中度颠簸，持续约2分钟。机组立即系好安全带指示灯，通知客舱乘务员检查客舱情况。颠簸结束后检查发现有1名乘客因未系安全带轻微擦伤。',
      'eventDescription': '起飞滑跑过程中，V1速度前约5秒，左发出现EGT超温警告，机组立即中断起飞，执行中断起飞程序。',
      'situation': '进近过程中，在距离跑道8海里处，TCAS发出TA警告，随后升级为RA警告"CLIMB CLIMB"。',
      
      // 警告和故障
      'warningType': 'GPWS "PULL UP"警告',
      'warningDuration': '抖杆累计3秒',
      'systemFailure': '左发EGT超温，显示825°C',
      'failureDescription': '自动驾驶仪突然断开，飞机开始右偏',
      'alarmType': '主警告灯红色闪烁，伴随连续警告音',
      
      // 操作和处置
      'crewAction': '立即执行QRH中的发动机火警检查单，关闭左发，宣布MAYDAY，申请就近备降',
      'operation': '中断起飞',
      'actionTaken': '通知塔台管制员，申请优先着陆',
      'measures': '执行单发着陆程序，通知客舱准备紧急撤离',
      'correctiveAction': '使用拖车将飞机拖回停机位',
      'responseLevel': '二级响应（紧急出动）',
      
      // 具体数值
      'speed': '250节',
      'heading': '航向270度',
      'deviation': '高度偏低150英尺',
      'deviationValue': '偏离航道左侧0.5海里',
      'duration': '持续约45秒',
      'distance': '距离跑道入口2海里',
      'fuelQuantity': '剩余燃油2.5吨',
      'temperature': 'EGT 825°C',
      'pressure': '客舱高度8500英尺',
      
      // 人员和伤情
      'personInfo': '32岁男性乘客，座位号15A',
      'injuryLevel': '轻伤（手臂擦伤）',
      'member': '副驾驶',
      'personRole': '客舱乘务员',
      'witnesses': '客舱乘务长李明、乘客王女士',
      
      // 原因分析
      'cause': '遭遇晴空颠簸，气象雷达未显示',
      'reason': '左发燃油喷嘴堵塞导致燃烧不充分',
      'rootCause': '机组对气象信息判断不准确',
      'contributingFactor': '夜间能见度较差，跑道灯光反射',
      
      // 后果影响
      'consequence': '航班延误2小时15分钟，更换备用飞机',
      'impact': '后续3个航班受到影响，平均延误30分钟',
      'damage': '左发叶片轻微损伤，需要更换',
      'result': '安全备降成都双流机场，无人员伤亡',
      
      // 特殊事件类型
      'collisionObject': '地面拖车',
      'entryArea': '首都机场P01禁区',
      'interferenceDesc': '121.5频率出现持续杂音干扰',
      'turbulenceLevel': '中度颠簸',
      'strikeType': '雷击左翼尖',
      'contaminant': '跑道积雪厚度2厘米',
      'leakageRate': '液压油渗漏约500毫升/分钟',
      'tireDamage': '主起落架右轮爆破',
      'objectCarried': 'APU进气道防护罩',
      
      // 通讯相关
      'frequency': '121.9MHz（塔台频率）',
      'interruptionDuration': '通讯中断5分30秒',
      'declarationType': 'MAYDAY MAYDAY MAYDAY',
      
      // 其他具体信息
      'issueType': '超重1.2吨',
      'errorType': '重心计算错误',
      'itemIssue': '货舱门密封条老化导致渗漏',
      'item': '左侧滑梯包',
      'failedConfig': '起落架未完全收起',
      'exceededParam': '坡度角45度（超出标准35度）',
      'raCommand': 'DESCEND DESCEND NOW',
      'avoidanceAction': '立即右转30度，下降500英尺',
      'deviationType': '偏离指定航路左侧',
      'fluidType': '1号液压系统液压油',
      'pressureValue': '液压压力降至1500PSI',
      'configIssue': '襟翼卡在15度位置',
      'systemStatus': '备用液压系统正常工作',
      'emergencyEquip': '氧气面罩自动脱落',
      'evacuationTime': '紧急撤离用时90秒',
      'passengerCount': '机上乘客156人，机组8人',
      'weatherCondition': '雷雨云团，云底高度1200米',
      'visibilityRange': '能见度降至800米',
      'windCondition': '阵风35节，风切变警告',
      'runwayCondition': '湿滑，刹车效应中等',
      'trafficInfo': '前方有B777正在着陆',
      'atcInstruction': '管制员指令立即右转航向090',
      'emergencyServices': '机场消防车已就位',
      'maintenanceAction': '更换左发高压涡轮叶片',
      'followUpMeasures': '加强机组培训，修订操作程序'
    }
  },

  onLoad(options: any) {
    const eventTypeId = options.eventTypeId;
    const eventType = getEventTypeById(eventTypeId);

    if (eventType) {
      console.log('加载的事件类型:', eventType.name);
      console.log('事件等级:', eventType.urgency);
      
      // 尝试加载草稿
      let draft = StorageService.getDraft(eventTypeId) || {};
      
      // 如果没有草稿，尝试从用户预设中填充
      if (Object.keys(draft).length === 0) {
        const userProfile = StorageService.getUserProfile();
        console.log('用户预设信息:', userProfile);
        if (userProfile) {
          // 自动填充机型
          let aircraftModelField = null;
          for (let i = 0; i < eventType.fields.length; i++) {
            if (eventType.fields[i].id === 'aircraftModel') {
              aircraftModelField = eventType.fields[i];
              break;
            }
          }
          if (aircraftModelField && userProfile.aircraftModel) {
            draft.aircraftModel = userProfile.aircraftModel;
          }
          
          // 自动填充姓名
          let nameField = null;
          for (let i = 0; i < eventType.fields.length; i++) {
            if (eventType.fields[i].id === 'name') {
              nameField = eventType.fields[i];
              break;
            }
          }
          if (nameField && userProfile.name) {
            draft.name = userProfile.name;
          }
          
          // 自动填充所属单位
          let companyField = null;
          for (let i = 0; i < eventType.fields.length; i++) {
            if (eventType.fields[i].id === 'company') {
              companyField = eventType.fields[i];
              break;
            }
          }
          if (companyField && userProfile.company) {
            draft.company = userProfile.company;
          }
          
          // 自动填充其他可能的字段
          eventType.fields.forEach((field: any) => {
            if (userProfile[field.id as keyof typeof userProfile]) {
              draft[field.id] = userProfile[field.id as keyof typeof userProfile];
            }
          });
        }
        
        // 自动填充当前时间
        let timeField = null;
        for (let i = 0; i < eventType.fields.length; i++) {
          if (eventType.fields[i].id === 'eventTime') {
            timeField = eventType.fields[i];
            break;
          }
        }
        if (timeField) {
          const now = new Date();
          const month = String(now.getMonth() + 1);
          const day = String(now.getDate());
          const hours = String(now.getHours());
          const minutes = String(now.getMinutes());
          draft.eventTime = `${now.getFullYear()}-${month.length === 1 ? '0' + month : month}-${day.length === 1 ? '0' + day : day} ${hours.length === 1 ? '0' + hours : hours}:${minutes.length === 1 ? '0' + minutes : minutes}`;
        }
      }

      // 设置自定义填报时限
      const userProfile = StorageService.getUserProfile();
      let customDeadline = '';
      if (userProfile) {
        if (eventType.urgency === '紧急' && userProfile.urgentDeadline) {
          customDeadline = userProfile.urgentDeadline;
        } else if (eventType.urgency === '非紧急' && userProfile.nonUrgentDeadline) {
          customDeadline = userProfile.nonUrgentDeadline;
        }
      }

      this.setData({
        eventType: eventType,
        formData: draft,
        customDeadline: customDeadline,
        totalFields: eventType.fields.length
      });
      
      // 计算初始进度
      this.updateProgress();
      
      console.log('自动填充的数据:', draft);
    } else {
      wx.showToast({
        title: '事件类型不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 获取字段占位符
  getFieldPlaceholder(field: any) {
    // 具象化的占位符示例，为每个字段提供非常具体的示例
    const placeholders: { [key: string]: string } = {
      // 基本信息字段
      'aircraftModel': 'B737-800',
      'eventTime': '2024-03-15 14:30',
      'flightInfo': 'CA1234',
      'flightNumber': 'MU5678',
      'route': '北京首都-上海浦东',
      'name': '张伟',
      'company': '中国国际航空股份有限公司',
      'position': '机长',
      'licenseNumber': 'ATPL-20240315001',
      'phone': '13812345678',
      'email': 'zhangwei@airchina.com',
      
      // 位置和环境
      'location': '北京首都机场T3航站楼32L跑道',
      'altitude': 'FL350（10668米）',
      'position': '距离首都机场东南方向25海里',
      'weather': '多云，能见度8公里，风向270度，风速15节',
      'phase': '巡航阶段',
      'controlArea': '北京区域管制中心',
      
      // 事件描述类
      'description': '14:30左右，航班在FL350巡航过程中遭遇中度颠簸，持续约2分钟。机组立即系好安全带指示灯，通知客舱乘务员检查客舱情况。颠簸结束后检查发现有1名乘客因未系安全带轻微擦伤。',
      'eventDescription': '起飞滑跑过程中，V1速度前约5秒，左发出现EGT超温警告，机组立即中断起飞，执行中断起飞程序。',
      'situation': '进近过程中，在距离跑道8海里处，TCAS发出TA警告，随后升级为RA警告"CLIMB CLIMB"。',
      
      // 警告和故障
      'warningType': 'GPWS "PULL UP"警告',
      'warningDuration': '抖杆累计3秒',
      'systemFailure': '左发EGT超温，显示825°C',
      'failureDescription': '自动驾驶仪突然断开，飞机开始右偏',
      'alarmType': '主警告灯红色闪烁，伴随连续警告音',
      
      // 操作和处置
      'crewAction': '立即执行QRH中的发动机火警检查单，关闭左发，宣布MAYDAY，申请就近备降',
      'operation': '中断起飞',
      'actionTaken': '通知塔台管制员，申请优先着陆',
      'measures': '执行单发着陆程序，通知客舱准备紧急撤离',
      'correctiveAction': '使用拖车将飞机拖回停机位',
      'responseLevel': '二级响应（紧急出动）',
      
      // 具体数值
      'speed': '250节',
      'heading': '航向270度',
      'deviation': '高度偏低150英尺',
      'deviationValue': '偏离航道左侧0.5海里',
      'duration': '持续约45秒',
      'distance': '距离跑道入口2海里',
      'fuelQuantity': '剩余燃油2.5吨',
      'temperature': 'EGT 825°C',
      'pressure': '客舱高度8500英尺',
      
      // 人员和伤情
      'personInfo': '32岁男性乘客，座位号15A',
      'injuryLevel': '轻伤（手臂擦伤）',
      'member': '副驾驶',
      'personRole': '客舱乘务员',
      'witnesses': '客舱乘务长李明、乘客王女士',
      
      // 原因分析
      'cause': '遭遇晴空颠簸，气象雷达未显示',
      'reason': '左发燃油喷嘴堵塞导致燃烧不充分',
      'rootCause': '机组对气象信息判断不准确',
      'contributingFactor': '夜间能见度较差，跑道灯光反射',
      
      // 后果影响
      'consequence': '航班延误2小时15分钟，更换备用飞机',
      'impact': '后续3个航班受到影响，平均延误30分钟',
      'damage': '左发叶片轻微损伤，需要更换',
      'result': '安全备降成都双流机场，无人员伤亡',
      
      // 特殊事件类型
      'collisionObject': '地面拖车',
      'entryArea': '首都机场P01禁区',
      'interferenceDesc': '121.5频率出现持续杂音干扰',
      'turbulenceLevel': '中度颠簸',
      'strikeType': '雷击左翼尖',
      'contaminant': '跑道积雪厚度2厘米',
      'leakageRate': '液压油渗漏约500毫升/分钟',
      'tireDamage': '主起落架右轮爆破',
      'objectCarried': 'APU进气道防护罩',
      
      // 通讯相关
      'frequency': '121.9MHz（塔台频率）',
      'interruptionDuration': '通讯中断5分30秒',
      'declarationType': 'MAYDAY MAYDAY MAYDAY',
      
      // 其他具体信息
      'issueType': '超重1.2吨',
      'errorType': '重心计算错误',
      'itemIssue': '货舱门密封条老化导致渗漏',
      'item': '左侧滑梯包',
      'failedConfig': '起落架未完全收起',
      'exceededParam': '坡度角45度（超出标准35度）',
      'raCommand': 'DESCEND DESCEND NOW',
      'avoidanceAction': '立即右转30度，下降500英尺',
      'deviationType': '偏离指定航路左侧',
      'fluidType': '1号液压系统液压油',
      'pressureValue': '液压压力降至1500PSI',
      'configIssue': '襟翼卡在15度位置',
      'systemStatus': '备用液压系统正常工作',
      'emergencyEquip': '氧气面罩自动脱落',
      'evacuationTime': '紧急撤离用时90秒',
      'passengerCount': '机上乘客156人，机组8人',
      'weatherCondition': '雷雨云团，云底高度1200米',
      'visibilityRange': '能见度降至800米',
      'windCondition': '阵风35节，风切变警告',
      'runwayCondition': '湿滑，刹车效应中等',
      'trafficInfo': '前方有B777正在着陆',
      'atcInstruction': '管制员指令立即右转航向090',
      'emergencyServices': '机场消防车已就位',
      'maintenanceAction': '更换左发高压涡轮叶片',
      'followUpMeasures': '加强机组培训，修订操作程序'
    };
    
    // 优先使用字段自带的占位符，如果没有则使用我们定义的具体示例
    if (field.placeholder) {
      return field.placeholder;
    }
    
    // 使用具体的示例
    const specificExample = placeholders[field.id];
    if (specificExample) {
      return specificExample;
    }
    
    // 如果都没有，根据字段类型提供通用示例
    switch (field.type) {
      case 'datetime':
        return '2024-03-15 14:30';
      case 'number':
        return '123';
      case 'textarea':
        return '请详细描述事件经过，包括时间、地点、具体情况、采取的措施等';
      default:
        return `请输入${field.label}`;
    }
  },

  // 返回上一页
  goBack() {
    // 检查是否有未保存的数据
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '提示',
        content: '您有未保存的数据，是否保存为草稿？',
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            this.saveDraft();
          }
          wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 检查是否有未保存的更改
  hasUnsavedChanges(): boolean {
    const currentData = this.data.formData;
    const eventTypeId = this.data.eventType && this.data.eventType.id ? this.data.eventType.id : '';
    const savedDraft = StorageService.getDraft(eventTypeId) || {};
    return JSON.stringify(currentData) !== JSON.stringify(savedDraft);
  },

  // 字段值变化
  onFieldChange(e: any) {
    const fieldId = e.currentTarget.dataset.fieldId;
    const value = e.detail.value || e.detail;
    
    this.setData({
      [`formData.${fieldId}`]: value
    });
    
    // 更新进度
    this.updateProgress();
    
    // 自动保存草稿
    this.autoSaveDraft();
  },

  // 更新进度
  updateProgress() {
    if (!this.data.eventType) return;
    
    const fields = this.data.eventType.fields;
    const formData = this.data.formData;
    
    let completedCount = 0;
    let requiredCompletedCount = 0;
    let requiredTotalCount = 0;
    
    fields.forEach(field => {
      const value = formData[field.id];
      const isCompleted = value && value.toString().trim() !== '';
      
      if (isCompleted) {
        completedCount++;
      }
      
      if (field.required) {
        requiredTotalCount++;
        if (isCompleted) {
          requiredCompletedCount++;
        }
      }
    });
    
    const progressPercentage = Math.round((completedCount / fields.length) * 100);
    const canSubmit = requiredCompletedCount === requiredTotalCount;
    
    this.setData({
      completedFields: completedCount,
      progressPercentage: progressPercentage,
      canSubmit: canSubmit
    });
  },

  // 获取字段状态
  getFieldStatus(fieldId: string): string {
    const value = this.data.formData[fieldId];
    const field = this.data.eventType && this.data.eventType.fields 
      ? this.data.eventType.fields.find(f => f.id === fieldId) 
      : undefined;
    
    if (!field) return 'empty';
    
    const hasValue = value && value.toString().trim() !== '';
    
    if (field.required && !hasValue) {
      return 'required';
    } else if (hasValue) {
      return 'filled';
    } else {
      return 'empty';
    }
  },

  // 获取字段状态文本
  getFieldStatusText(fieldId: string): string {
    const status = this.getFieldStatus(fieldId);
    const statusMap = {
      'empty': '待填写',
      'filled': '已完成',
      'required': '必填项'
    };
    return statusMap[status] || '待填写';
  },

  // 获取字段状态图标
  getFieldStatusIcon(fieldId: string): string {
    const status = this.getFieldStatus(fieldId);
    const iconMap = {
      'empty': '⭕',
      'filled': '✅',
      'required': '❗'
    };
    return iconMap[status] || '⭕';
  },

  // 自动保存草稿
  autoSaveDraft() {
    if (this.data.eventType) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => {
        StorageService.saveDraft(this.data.eventType!.id, this.data.formData);
      }, 2000); // 2秒后自动保存
    }
  },

  // 保存草稿
  saveDraft() {
    if (!this.data.eventType) return;
    
    StorageService.saveDraft(this.data.eventType.id, this.data.formData);
    wx.showToast({
      title: '草稿已保存',
      icon: 'success',
      duration: 1500
    });
  },

  // 显示日期时间选择器
  showDateTimePicker(e: any) {
    const fieldId = e.currentTarget.dataset.fieldId;
    const currentValue = this.data.formData[fieldId];
    
    const now = new Date();
    let selectedDate = now.getTime();
    let selectedHour = now.getHours();
    let selectedMinute = Math.floor(now.getMinutes() / 5);
    
    if (currentValue) {
      const isoFormat = currentValue.replace(' ', 'T') + ':00';
      const parsedDate = new Date(isoFormat);
      if (!isNaN(parsedDate.getTime())) {
        selectedDate = parsedDate.getTime();
        selectedHour = parsedDate.getHours();
        selectedMinute = Math.floor(parsedDate.getMinutes() / 5);
      }
    }
    
    this.setData({
      showDatePicker: true,
      selectedDate: selectedDate,
      selectedHour: selectedHour,
      selectedMinute: selectedMinute,
      currentFieldId: fieldId
    });
  },

  // 日期变化
  onDateChange(e: any) {
    this.setData({
      selectedDate: e.detail
    });
  },

  // 小时变化
  onHourChange(e: any) {
    const hourIndex = e.detail.value;
    this.setData({
      selectedHour: hourIndex
    });
    this.updateSelectedTime();
  },

  // 分钟变化
  onMinuteChange(e: any) {
    const minuteIndex = e.detail.value;
    this.setData({
      selectedMinute: minuteIndex
    });
    this.updateSelectedTime();
  },

  // 更新选择的时间
  updateSelectedTime() {
    const hour = this.data.selectedHour;
    const minute = this.data.selectedMinute * 5; // 每5分钟一个间隔
    const today = new Date();
    const newTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
    
    this.setData({
      selectedTime: newTime.getTime()
    });
  },

  // 下一步
  nextStep() {
    const currentStep = this.data.currentStep;
    if (currentStep < 2) { // 最多只有2步
      this.setData({
        currentStep: currentStep + 1
      });
    }
  },

  // 上一步
  prevStep() {
    const currentStep = this.data.currentStep;
    if (currentStep > 1) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },

  // 快捷时间选择
  selectQuickTime(e: any) {
    const timeType = e.currentTarget.dataset.time;
    const now = new Date();
    let hour = 0;
    let minute = 0;
    
    switch (timeType) {
      case 'now':
        hour = now.getHours();
        minute = Math.floor(now.getMinutes() / 5);
        break;
      case 'morning':
        hour = 9;
        minute = 0;
        break;
      case 'noon':
        hour = 12;
        minute = 0;
        break;
      case 'afternoon':
        hour = 14;
        minute = 0;
        break;
      case 'evening':
        hour = 18;
        minute = 0;
        break;
    }
    
    this.setData({
      selectedHour: hour,
      selectedMinute: minute
    });
    this.updateSelectedTime();
  },

  // 获取当前时间文本
  getCurrentTimeText() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 格式化选择的日期
  formatSelectedDate() {
    const date = new Date(this.data.selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 ${weekday}`;
  },

  // 格式化选择的时间
  formatSelectedTime() {
    // 直接使用选择的小时和分钟
    const hour = this.data.selectedHour;
    const minute = this.data.selectedMinute * 5; // 转换为实际分钟
    
    const hours = String(hour).padStart(2, '0');
    const minutes = String(minute).padStart(2, '0');
    
    // 判断上午下午
    const period = hour < 12 ? '上午' : '下午';
    
    return `${period} ${hours}:${minutes}`;
  },

  // 格式化完整日期时间
  formatFullDateTime() {
    const selectedDate = new Date(this.data.selectedDate);
    const hour = this.data.selectedHour;
    const minute = this.data.selectedMinute * 5; // 转换为实际分钟
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const hours = String(hour).padStart(2, '0');
    const minutes = String(minute).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 关闭日期时间选择器
  closeDateTimePicker() {
    this.setData({
      showDatePicker: false,
      currentFieldId: ''
    });
  },

  // 时间选择器变化
  onTimeChange(e: any) {
    const [hourIndex, minuteIndex] = e.detail.value;
    this.setData({
      selectedHour: hourIndex,
      selectedMinute: minuteIndex
    });
  },

  // 关闭验证对话框
  closeValidationDialog() {
    this.setData({
      showValidationDialog: false,
      validationMessage: ''
    });
  },

  // 确认日期时间
  confirmDateTime() {
    const selectedDate = new Date(this.data.selectedDate);
    const hour = this.data.selectedHour;
    const minute = this.data.selectedMinute * 5;
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const hours = String(hour).padStart(2, '0');
    const minutes = String(minute).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    this.setData({
      [`formData.${this.data.currentFieldId}`]: formattedDateTime,
      showDatePicker: false,
      currentFieldId: ''
    });
    
    // 更新进度
    this.updateProgress();
    
    wx.showToast({
      title: '时间设置成功',
      icon: 'success',
      duration: 1500
    });
  },



  // 生成报告
  generateReport() {
    if (!this.data.eventType) return;

    // 验证表单
    const validation = ReportBuilder.validateFormData(this.data.eventType, this.data.formData);
    if (!validation.isValid) {
      this.setData({
        showValidationDialog: true,
        validationMessage: `请填写以下必填项：\n${validation.missingFields.join('、')}`
      });
      return;
    }

    // 清除草稿
    StorageService.clearDraft(this.data.eventType.id);

    // 跳转到预览页面
    wx.navigateTo({
      url: '/packageO/event-report/event-preview',
      success: (res) => {
        res.eventChannel.emit('reportData', {
          eventType: this.data.eventType,
          formData: this.data.formData
        });
      }
    });
  },

  // 添加自动保存定时器属性
  autoSaveTimer: null as any
}); 