/**
 * CPDLC电文数据模板
 * 管制员-飞行员数据链通信(CPDLC)电文集
 *
 * 数据结构说明:
 * - uplink: 上行电文(管制员->飞行员)
 * - downlink: 下行电文(飞行员->管制员)
 *
 * 每条电文包含:
 * - id: 电文编号
 * - category: 分类(例如:回答/认收、垂直许可、速度变化等)
 * - purpose: 电文目的/用途(中文描述)
 * - format_en: 电文规定格式(英文)
 * - format_zh: 电文规定格式(中文)
 * - urgent: 紧急级别(N-正常, U-紧急, D-遇险, M-中等, L-低)
 * - alert: 告警级别(N-无, L-低, M-中, H-高)
 * - response: 回答要求(N-不需要, Y-需要, R-收到, W/U-照办/不能, A/N-是/否)
 */

var cpdlcMessages = {
  // 上行电文(管制员->飞行员)
  uplink: [
    // 示例数据 - 表A5-1 回答/认收(上行)
    {
      id: '0',
      category: '回答/认收',
      purpose: '表示 ATC 不能同意请求。',
      format_en: 'UNABLE',
      format_zh: '不能',
      urgent: 'N',
      alert: 'M',
      response: 'N'
    },
    {
      id: '1',
      category: '回答/认收',
      purpose: '表示 ATC 收到电文，将予以答复。',
      format_en: 'STANDBY',
      format_zh: '请等候',
      urgent: 'N',
      alert: 'L',
      response: 'N'
    }
    // ... 其他上行电文数据由AI转换
  ],

  // 下行电文(飞行员->管制员)
  downlink: [
    // 示例数据 - 表A5-14 回答(下行)
    {
      id: '0',
      category: '回答',
      purpose: '明白指令，照办。',
      format_en: 'WILCO',
      format_zh: '照办',
      urgent: 'N',
      alert: 'M',
      response: 'N'
    },
    {
      id: '1',
      category: '回答',
      purpose: '不能照办。',
      format_en: 'UNABLE',
      format_zh: '不能',
      urgent: 'N',
      alert: 'M',
      response: 'N'
    }
    // ... 其他下行电文数据由AI转换
  ],

  // 分类列表(用于筛选)
  categories: {
    uplink: [
      '回答/认收',
      '垂直许可',
      '穿越限制',
      '横向偏离',
      '航路改变',
      '速度变化',
      '联络/监测/监视请求',
      '报告/证实请求',
      '询问请求',
      '空中交通咨询',
      '系统管理电文',
      '间距电文',
      '其他电文'
    ],
    downlink: [
      '回答',
      '垂直请求',
      '横向偏离请求',
      '速度请求',
      '话音联络请求',
      '航路改变请求',
      '报告',
      '询问请求',
      '紧急电文',
      '系统管理电文',
      '间距信息',
      '其他电文',
      '询问回答'
    ]
  }
};

module.exports = cpdlcMessages;
