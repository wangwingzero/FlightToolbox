/**
 * P章飞行机组值勤期限制法规数据
 * 数据来源：CCAR-121 P章
 * 
 * 关键定义：
 * - 飞行值勤期(FDP): 从报到到最后一次飞行后发动机关车的时间段
 * - 飞行时间: 实际操纵飞机的时间
 * - 航段: 从起飞到着陆的单次飞行
 */

/**
 * 表A - 非扩编飞行机组最大飞行时间限制
 * 根据报到时间确定最大飞行时间
 * 
 * 法规依据：第121.483条(a)款第(1)项
 */
var TABLE_A = {
  timeRanges: [
    { start: '00:00', end: '04:59', maxFlightTime: 8 },
    { start: '05:00', end: '19:59', maxFlightTime: 9 },
    { start: '20:00', end: '23:59', maxFlightTime: 8 }
  ]
};

/**
 * 表B - 非扩编飞行机组最大飞行值勤期限制
 * 根据报到时间和航段数确定最大飞行值勤期
 * 
 * 法规依据：第121.485条(a)款
 */
var TABLE_B = {
  timeRanges: [
    {
      start: '00:00',
      end: '04:59',
      segments: {
        '1-4': 12,
        '5': 11,
        '6': 10,
        '7+': 9
      }
    },
    {
      start: '05:00',
      end: '11:59',
      segments: {
        '1-4': 14,
        '5': 13,
        '6': 12,
        '7+': 11
      }
    },
    {
      start: '12:00',
      end: '23:59',
      segments: {
        '1-4': 13,
        '5': 12,
        '6': 11,
        '7+': 10
      }
    }
  ]
};

/**
 * 表C - 扩编飞行机组最大飞行值勤期限制
 * 根据飞行员数量和机上休息设施等级确定最大飞行值勤期
 * 
 * 法规依据：第121.485条(b)款第(1)项
 */
var TABLE_C = {
  crewConfigs: [
    {
      crewCount: 3,
      maxFlightTime: 13,
      restFacilities: [
        { level: 1, name: '1级休息设施', maxFDP: 18 },
        { level: 2, name: '2级休息设施', maxFDP: 17 },
        { level: 3, name: '3级休息设施', maxFDP: 16 }
      ]
    },
    {
      crewCount: 4,
      maxFlightTime: 17,
      restFacilities: [
        { level: 1, name: '1级休息设施', maxFDP: 20 },
        { level: 2, name: '2级休息设施', maxFDP: 19 },
        { level: 3, name: '3级休息设施', maxFDP: 18 }
      ]
    }
  ]
};

/**
 * 扩编机组最大飞行时间
 * 
 * 法规依据：第121.483条(a)款第(2)(3)项
 */
var AUGMENTED_FLIGHT_TIME = {
  3: 13, // 3名驾驶员: 13小时
  4: 17  // 4名驾驶员: 17小时
};

/**
 * 累积飞行时间和值勤期限制
 * 
 * 法规依据：第121.487条
 */
var CUMULATIVE_LIMITS = {
  continuous7Days: {
    fdp: 60,
    label: '任何连续7个日历日',
    regulation: '第121.487条(c)款第(1)项'
  },
  monthly: {
    flightTime: 100,
    fdp: 210,
    label: '任一日历月',
    regulation: '第121.487条(b)款第(1)项和(c)款第(2)项'
  },
  yearly: {
    flightTime: 900,
    label: '任一日历年',
    regulation: '第121.487条(b)款第(2)项'
  }
};

/**
 * 休息期要求
 * 
 * 法规依据：第121.495条
 */
var REST_REQUIREMENTS = {
  minRestAfterDuty: {
    hours: 10,
    description: '飞行值勤期结束后，到下一个飞行值勤期开始前',
    regulation: '第121.495条(d)款'
  },
  continuousRest: {
    hours: 48,
    within: 144, // 6天
    description: '任何连续144小时内',
    regulation: '第121.495条(b)款'
  },
  timezoneDifference: {
    threshold: 6, // 6小时时差
    restAfterReturn: 48,
    description: '跨时区运行后返回基地',
    regulation: '第121.495条(c)款'
  }
};

/**
 * 休息设施等级说明
 */
var REST_FACILITY_DESCRIPTIONS = {
  1: {
    name: '1级休息设施',
    description: '独立于驾驶舱和客舱的铺位，可控制温度和光线，不受打扰和噪音影响',
    example: '机组专用休息室的床铺'
  },
  2: {
    name: '2级休息设施',
    description: '客舱内可平躺或接近平躺的座位，有隔帘与乘客分隔，能遮光降噪',
    example: '公务舱/头等舱可平躺座椅'
  },
  3: {
    name: '3级休息设施',
    description: '客舱或驾驶舱内可倾斜40度并有脚部支撑的座位',
    example: '高端经济舱或普通公务舱座椅'
  }
};

/**
 * 法规条款引用
 */
var REGULATIONS = {
  tableA: '第121.483条(a)款第(1)项 - 表A',
  tableB: '第121.485条(a)款 - 表B',
  tableC: '第121.485条(b)款第(1)项 - 表C',
  augmentedFlightTime: '第121.483条(a)款第(2)(3)项',
  cumulativeLimits: '第121.487条',
  restRequirements: '第121.495条'
};

module.exports = {
  TABLE_A: TABLE_A,
  TABLE_B: TABLE_B,
  TABLE_C: TABLE_C,
  AUGMENTED_FLIGHT_TIME: AUGMENTED_FLIGHT_TIME,
  CUMULATIVE_LIMITS: CUMULATIVE_LIMITS,
  REST_REQUIREMENTS: REST_REQUIREMENTS,
  REST_FACILITY_DESCRIPTIONS: REST_FACILITY_DESCRIPTIONS,
  REGULATIONS: REGULATIONS
};

