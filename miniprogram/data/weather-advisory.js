/**
 * 航空气象报文解码配置库
 * 基于 ICAO Annex 3 Appendix 2 & 3
 */

var MessageConfig = {
  // =================================================================
  // 1. 火山灰咨询报文 (VA ADVISORY)
  // =================================================================
  VA_ADVISORY: {
    id: "VA_ADVISORY",
    displayNameZh: "火山灰咨询报文",
    descriptionZh: "由火山灰咨询中心 (VAAC) 发布，用于报告和预报火山灰云的位置、高度及移动方向。",
    // 解析策略：Key-Value (冒号分隔)
    parserType: "KEY_VALUE_COLON", 
    fields: [
      {
        code: "VA ADVISORY",
        labelZh: "报文类型",
        required: true,
        pattern: "^VA ADVISORY$",
        valueExample: "VA ADVISORY",
        valueExplainZh: "标识这是一份火山灰咨询报文。",
        group: "header"
      },
      {
        code: "STATUS",
        labelZh: "状态指示",
        required: false, // Conditional
        pattern: "^STATUS:\\s*(TEST|EXER)$",
        valueExample: "STATUS: TEST",
        valueExplainZh: "指示这是一次测试 (TEST) 或演习 (EXER)，不可用于实际飞行。",
        group: "header"
      },
      {
        code: "DTG",
        labelZh: "发报时间",
        required: true,
        pattern: "^DTG:\\s*(\\d{8}/\\d{4}Z)$",
        valueExample: "DTG: 20080923/0130Z",
        valueExplainZh: "报文签发时间 (UTC)，格式为 YYYYMMDD/HHMMZ。",
        group: "header"
      },
      {
        code: "VAAC",
        labelZh: "发布中心",
        required: true,
        pattern: "^VAAC:\\s*(.+)$",
        valueExample: "VAAC: TOKYO",
        valueExplainZh: "发布此报文的火山灰咨询中心名称。",
        group: "header"
      },
      {
        code: "VOLCANO",
        labelZh: "火山名称",
        required: true,
        pattern: "^VOLCANO:\\s*(.+)$",
        valueExample: "VOLCANO: KARYMSKY 1000-13",
        valueExplainZh: "火山名称及 IAVCEI 编号。",
        group: "volcano_info"
      },
      {
        code: "PSN",
        labelZh: "火山位置",
        required: true,
        pattern: "^PSN:\\s*([NS]\\d{4}\\s*[EW]\\d{5}|UNKNOWN)$",
        valueExample: "PSN: N5403 E15927",
        valueExplainZh: "火山的地理坐标（经纬度）。",
        group: "volcano_info"
      },
      {
        code: "AREA",
        labelZh: "区域/国家",
        required: true,
        pattern: "^AREA:\\s*(.+)$",
        valueExample: "AREA: RUSSIA",
        valueExplainZh: "火山所在的国家或地理区域。",
        group: "volcano_info"
      },
      {
        code: "SUMMIT ELEV",
        labelZh: "山顶高度",
        required: true,
        pattern: "^SUMMIT ELEV:\\s*(\\d+M|\\d+FT)$",
        valueExample: "SUMMIT ELEV: 1536M",
        valueExplainZh: "火山顶的海拔高度（米或英尺）。",
        group: "volcano_info"
      },
      {
        code: "ADVISORY NR",
        labelZh: "咨询报编号",
        required: true,
        pattern: "^ADVISORY NR:\\s*(\\d{4}/\\d+)$",
        valueExample: "ADVISORY NR: 2008/4",
        valueExplainZh: "年份/序号，针对该火山的第几份报文。",
        group: "header"
      },
      {
        code: "INFO SOURCE",
        labelZh: "信息来源",
        required: true,
        pattern: "^INFO SOURCE:\\s*(.+)$",
        valueExample: "INFO SOURCE: MTSAT-1R KVERT KEMSD",
        valueExplainZh: "观测火山灰所使用的卫星或其他信息源。",
        group: "meta"
      },
      {
        code: "AVIATION COLOUR CODE",
        labelZh: "航空颜色代码",
        required: false,
        pattern: "^AVIATION COLOUR CODE:\\s*(RED|ORANGE|YELLOW|GREEN|UNKNOWN|NOT GIVEN|NIL)$",
        valueExample: "AVIATION COLOUR CODE: RED",
        valueExplainZh: "指示火山活动的危险程度（红/橙/黄/绿）。",
        group: "meta"
      },
      {
        code: "ERUPTION DETAILS",
        labelZh: "喷发详情",
        required: true,
        pattern: "^ERUPTION DETAILS:\\s*(.+)$",
        valueExample: "ERUPTION DETAILS: ERUPTION AT 20080923/0000Z FL300 REPORTED",
        valueExplainZh: "关于喷发时间、高度等细节的文字描述。",
        group: "meta"
      },
      {
        code: "OBS VA DTG",
        labelZh: "火山灰观测时间",
        required: true,
        pattern: "^OBS VA DTG:\\s*(\\d{2}/\\d{4}Z)$",
        valueExample: "OBS VA DTG: 23/0100Z",
        valueExplainZh: "实测火山灰云团的对应时间 (日/UTC时间)。",
        group: "observation"
      },
      {
        code: "OBS VA CLD",
        labelZh: "实测火山灰云",
        required: true,
        multiline: true, // 标记该字段可能跨多行
        pattern: "^OBS VA CLD:\\s*(.*)$", 
        valueExample: "OBS VA CLD: FL250/300 N5400 E15930 - N5400 E16100 ...",
        valueExplainZh: "实测火山灰的垂直高度（FL）和水平范围（坐标连线），可能包含移动速度。",
        group: "observation"
      },
      {
        code: "FCST VA CLD +6HR",
        labelZh: "6小时预报",
        required: true,
        multiline: true,
        pattern: "^FCST VA CLD \\+6HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST VA CLD +6HR: 23/0700Z FL250/350 N5130 E16030 ...",
        valueExplainZh: "观测时间后6小时的火山灰预期位置和高度。",
        group: "forecast"
      },
      {
        code: "FCST VA CLD +12HR",
        labelZh: "12小时预报",
        required: true,
        multiline: true,
        pattern: "^FCST VA CLD \\+12HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST VA CLD +12HR: 23/1300Z SFC/FL270 N4830 E16130 ...",
        valueExplainZh: "观测时间后12小时的火山灰预期位置和高度。",
        group: "forecast"
      },
      {
        code: "FCST VA CLD +18HR",
        labelZh: "18小时预报",
        required: true,
        multiline: true,
        pattern: "^FCST VA CLD \\+18HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST VA CLD +18HR: 23/1900Z NO VA EXP",
        valueExplainZh: "观测时间后18小时的火山灰预期位置和高度。",
        group: "forecast"
      },
      {
        code: "RMK",
        labelZh: "备注",
        required: true,
        pattern: "^RMK:\\s*(.+)$",
        valueExample: "RMK: LATEST REP FM KVERT (0120Z) INDICATES ERUPTION HAS CEASED...",
        valueExplainZh: "附加说明信息。",
        group: "footer"
      },
      {
        code: "NXT ADVISORY",
        labelZh: "下份报文",
        required: true,
        pattern: "^NXT ADVISORY:\\s*(.+)$",
        valueExample: "NXT ADVISORY: 20080923/0730Z",
        valueExplainZh: "预计下一次发布咨询报的时间，或 'NO FURTHER ADVISORIES'。",
        group: "footer"
      }
    ]
  },

  // =================================================================
  // 2. 热带气旋咨询报文 (TC ADVISORY)
  // =================================================================
  TC_ADVISORY: {
    id: "TC_ADVISORY",
    displayNameZh: "热带气旋咨询报文",
    descriptionZh: "由热带气旋咨询中心 (TCAC) 发布，提供热带气旋的定位、强度及移动预报。",
    parserType: "KEY_VALUE_COLON",
    fields: [
      {
        code: "TC ADVISORY",
        labelZh: "报文类型",
        required: true,
        pattern: "^TC ADVISORY$",
        valueExample: "TC ADVISORY",
        valueExplainZh: "标识这是一份热带气旋咨询报文。",
        group: "header"
      },
      {
        code: "DTG",
        labelZh: "发报时间",
        required: true,
        pattern: "^DTG:\\s*(\\d{8}/\\d{4}Z)$",
        valueExample: "DTG: 20040925/1900Z",
        valueExplainZh: "报文签发时间 (YYYYMMDD/HHMMZ)。",
        group: "header"
      },
      {
        code: "TCAC",
        labelZh: "发布中心",
        required: true,
        pattern: "^TCAC:\\s*(.+)$",
        valueExample: "TCAC: YUFO",
        valueExplainZh: "发布此报文的热带气旋咨询中心。",
        group: "header"
      },
      {
        code: "TC",
        labelZh: "气旋名称",
        required: true,
        pattern: "^TC:\\s*(.+)$",
        valueExample: "TC: GLORIA",
        valueExplainZh: "热带气旋的名字，如果未命名则为 NN。",
        group: "header"
      },
      {
        code: "ADVISORY NR",
        labelZh: "咨询报编号",
        required: true,
        pattern: "^ADVISORY NR:\\s*(\\d{4}/\\d+)$",
        valueExample: "ADVISORY NR: 2004/13",
        valueExplainZh: "年份/序号。",
        group: "header"
      },
      {
        code: "OBS PSN",
        labelZh: "中心定位",
        required: true,
        pattern: "^OBS PSN:\\s*(\\d{2}/\\d{4}Z)\\s+([NS]\\d{4}\\s*[EW]\\d{5})$",
        valueExample: "OBS PSN: 25/1800Z N2706 W07306",
        valueExplainZh: "在特定时间观测到的气旋中心经纬度坐标。",
        group: "observation"
      },
      {
        code: "CB",
        labelZh: "积雨云范围",
        required: false,
        pattern: "^CB:\\s*(.+)$",
        valueExample: "CB: WI 250NM OF TC CENTRE TOP FL500",
        valueExplainZh: "与气旋相关的积雨云(CB)分布范围及云顶高度。",
        group: "observation"
      },
      {
        code: "MOV",
        labelZh: "移动方向/速度",
        required: true,
        pattern: "^MOV:\\s*(.+)$",
        valueExample: "MOV: NW 20KMH",
        valueExplainZh: "气旋的移动方向（16方位）和速度（KMH或KT）。STNR 表示静止。",
        group: "observation"
      },
      {
        code: "C",
        labelZh: "中心气压",
        required: true,
        pattern: "^C:\\s*(\\d{3,4}HPA)$",
        valueExample: "C: 965HPA",
        valueExplainZh: "气旋中心的最低气压。",
        group: "observation"
      },
      {
        code: "MAX WIND",
        labelZh: "最大风速",
        required: true,
        pattern: "^MAX WIND:\\s*(\\d+(MPS|KT))$",
        valueExample: "MAX WIND: 22MPS",
        valueExplainZh: "靠近中心的地面最大风速。",
        group: "observation"
      },
      {
        code: "FCST PSN +6HR",
        labelZh: "6小时预报位置",
        required: true,
        pattern: "^FCST PSN \\+6HR:\\s*(\\d{2}/\\d{4}Z)\\s+([NS]\\d{4}\\s*[EW]\\d{5})$",
        valueExample: "FCST PSN +6HR: 25/2200Z N2748 W07350",
        valueExplainZh: "6小时后的预测中心位置。",
        group: "forecast"
      },
      {
        code: "FCST MAX WIND +6HR",
        labelZh: "6小时预报风速",
        required: true,
        pattern: "^FCST MAX WIND \\+6HR:\\s*(\\d+(MPS|KT))$",
        valueExample: "FCST MAX WIND +6HR: 22MPS",
        valueExplainZh: "6小时后的预测最大风速。",
        group: "forecast"
      },
      {
        code: "FCST PSN +12HR",
        labelZh: "12小时预报位置",
        required: true,
        pattern: "^FCST PSN \\+12HR:\\s*(\\d{2}/\\d{4}Z)\\s+([NS]\\d{4}\\s*[EW]\\d{5})$",
        valueExample: "FCST PSN +12HR: 26/0400Z N2830 W07430",
        valueExplainZh: "12小时后的预测中心位置。",
        group: "forecast"
      },
      {
        code: "FCST MAX WIND +12HR",
        labelZh: "12小时预报风速",
        required: true,
        pattern: "^FCST MAX WIND \\+12HR:\\s*(\\d+(MPS|KT))$",
        valueExample: "FCST MAX WIND +12HR: 22MPS",
        valueExplainZh: "12小时后的预测最大风速。",
        group: "forecast"
      },
      {
        code: "FCST PSN +18HR",
        labelZh: "18小时预报位置",
        required: true,
        pattern: "^FCST PSN \\+18HR:\\s*(\\d{2}/\\d{4}Z)\\s+([NS]\\d{4}\\s*[EW]\\d{5})$",
        valueExample: "FCST PSN +18HR: 26/1000Z N2852 W07500",
        valueExplainZh: "18小时后的预测中心位置。",
        group: "forecast"
      },
      {
        code: "FCST MAX WIND +18HR",
        labelZh: "18小时预报风速",
        required: true,
        pattern: "^FCST MAX WIND \\+18HR:\\s*(\\d+(MPS|KT))$",
        valueExample: "FCST MAX WIND +18HR: 21MPS",
        valueExplainZh: "18小时后的预测最大风速。",
        group: "forecast"
      },
      {
        code: "FCST PSN +24HR",
        labelZh: "24小时预报位置",
        required: true,
        pattern: "^FCST PSN \\+24HR:\\s*(\\d{2}/\\d{4}Z)\\s+([NS]\\d{4}\\s*[EW]\\d{5})$",
        valueExample: "FCST PSN +24HR: 26/1600Z N2912 W07530",
        valueExplainZh: "24小时后的预测中心位置。",
        group: "forecast"
      },
      {
        code: "FCST MAX WIND +24HR",
        labelZh: "24小时预报风速",
        required: true,
        pattern: "^FCST MAX WIND \\+24HR:\\s*(\\d+(MPS|KT))$",
        valueExample: "FCST MAX WIND +24HR: 20MPS",
        valueExplainZh: "24小时后的预测最大风速。",
        group: "forecast"
      },
      {
        code: "RMK",
        labelZh: "备注",
        required: true,
        pattern: "^RMK:\\s*(.+)$",
        valueExample: "RMK: NIL",
        valueExplainZh: "附加信息。",
        group: "footer"
      },
      {
        code: "NXT MSG",
        labelZh: "下份报文",
        required: true,
        pattern: "^NXT MSG:\\s*(.+)$",
        valueExample: "NXT MSG: 19970925/2000Z",
        valueExplainZh: "预计下份报文发布时间。",
        group: "footer"
      }
    ]
  },

  // =================================================================
  // 3. 空间天气咨询报文 (SWX ADVISORY)
  // =================================================================
  SWX_ADVISORY: {
    id: "SWX_ADVISORY",
    displayNameZh: "空间天气咨询报文",
    descriptionZh: "由空间天气中心 (SWXC) 发布，报告太阳活动对高频通信 (HF)、卫星通信 (SATCOM)、GNSS 或辐射的影响。",
    parserType: "KEY_VALUE_COLON",
    fields: [
      {
        code: "SWX ADVISORY",
        labelZh: "报文类型",
        required: true,
        pattern: "^SWX ADVISORY$",
        valueExample: "SWX ADVISORY",
        valueExplainZh: "标识这是一份空间天气咨询报文。",
        group: "header"
      },
      {
        code: "DTG",
        labelZh: "发报时间",
        required: true,
        pattern: "^DTG:\\s*(\\d{8}/\\d{4}Z)$",
        valueExample: "DTG: 20161108/0100Z",
        valueExplainZh: "报文签发时间。",
        group: "header"
      },
      {
        code: "SWXC",
        labelZh: "发布中心",
        required: true,
        pattern: "^SWXC:\\s*(.+)$",
        valueExample: "SWXC: DONLON",
        valueExplainZh: "发布报文的空间天气中心。",
        group: "header"
      },
      {
        code: "ADVISORY NR",
        labelZh: "咨询报编号",
        required: true,
        pattern: "^ADVISORY NR:\\s*(\\d{4}/\\d+)$",
        valueExample: "ADVISORY NR: 2016/2",
        valueExplainZh: "年份/序号。",
        group: "header"
      },
      {
        code: "NR RPLC",
        labelZh: "替换报号",
        required: false,
        pattern: "^NR RPLC:\\s*(\\d{4}/\\d+)$",
        valueExample: "NR RPLC: 2016/1",
        valueExplainZh: "被此报文替换的旧报文编号。",
        group: "header"
      },
      {
        code: "SWX EFFECT",
        labelZh: "空间天气影响",
        required: true,
        pattern: "^SWX EFFECT:\\s*(.+)$",
        valueExample: "SWX EFFECT: HF COM MOD AND GNSS MOD",
        valueExplainZh: "受影响的系统（HF COM, GNSS, RADIATION, SATCOM）及强度（MOD, SEV）。",
        group: "observation"
      },
      {
        code: "OBS SWX",
        labelZh: "观测现象",
        required: true,
        pattern: "^OBS SWX:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "OBS SWX: 08/0100Z HNH HSH E18000 - W18000",
        valueExplainZh: "观测时间及受影响的地理范围（HNH高纬北半球等）。",
        group: "observation"
      },
      {
        code: "FCST SWX +6HR",
        labelZh: "6小时预报",
        required: true,
        pattern: "^FCST SWX \\+6HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST SWX +6HR: 08/0700Z HNH HSH E18000 - W18000",
        valueExplainZh: "6小时后预期影响范围。",
        group: "forecast"
      },
      {
        code: "FCST SWX +12HR",
        labelZh: "12小时预报",
        required: true,
        pattern: "^FCST SWX \\+12HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST SWX +12HR: 08/1300Z HNH HSH E18000 - W18000",
        valueExplainZh: "12小时后预期影响范围。",
        group: "forecast"
      },
      {
        code: "FCST SWX +18HR",
        labelZh: "18小时预报",
        required: true,
        pattern: "^FCST SWX \\+18HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST SWX +18HR: 08/1900Z HNH HSH E18000 - W18000",
        valueExplainZh: "18小时后预期影响范围。",
        group: "forecast"
      },
      {
        code: "FCST SWX +24HR",
        labelZh: "24小时预报",
        required: true,
        pattern: "^FCST SWX \\+24HR:\\s*(\\d{2}/\\d{4}Z)\\s+(.*)$",
        valueExample: "FCST SWX +24HR: 09/0100Z NO SWX EXP",
        valueExplainZh: "24小时后预期影响范围。",
        group: "forecast"
      },
      {
        code: "RMK",
        labelZh: "备注",
        required: true,
        pattern: "^RMK:\\s*(.+)$",
        valueExample: "RMK: LOW LVL GEOMAGNETIC STORMING CAUSING...",
        valueExplainZh: "详细说明或参考网址。",
        group: "footer"
      },
      {
        code: "NXT ADVISORY",
        labelZh: "下份报文",
        required: true,
        pattern: "^NXT ADVISORY:\\s*(.+)$",
        valueExample: "NXT ADVISORY: NO FURTHER ADVISORIES",
        valueExplainZh: "下次发布时间或结束通知。",
        group: "footer"
      }
    ]
  },

  // =================================================================
  // 4. 机场例行/特殊报告 (MET REPORT / SPECIAL)
  // =================================================================
  MET_REPORT: {
    id: "MET_REPORT",
    displayNameZh: "机场例行/特殊天气报告",
    descriptionZh: "机场向塔台/进近管制提供的本地实时天气报告 (MET REPORT) 或特殊天气报告 (SPECIAL)。注意：这与 METAR 不同。",
    // 解析策略：关键字分割 (Keyword Tokenizer)
    parserType: "KEYWORD_TOKENIZER",
    fields: [
      {
        code: "HEADER",
        labelZh: "报头",
        required: true,
        // 匹配类型(MET REPORT/SPECIAL) + 机场代码 + 时间
        pattern: "^(MET REPORT|SPECIAL)\\s+([A-Z]{4})\\s+(\\d{6}Z)",
        valueExample: "MET REPORT YUDO 221630Z",
        valueExplainZh: "包含报文类型、四字代码和UTC观测时间。",
        group: "header"
      },
      {
        code: "WIND",
        labelZh: "地面风",
        required: true,
        // 匹配 WIND 关键字开始，直到遇到 VIS 或其他关键字
        pattern: "WIND\\s+([\\w/]+(?:\\s+(?:MAX\\d+|MNM\\d+|VRB|BTN|AND|RWY\\s+\\w+))*)(?=\\s+VIS|\\s+RVR|\\s+CLD|\\s+T|\\s+QNH|\\s+MOD|\\s+HVY|\\s+FBL|\\s+NSC|\\s+CAVOK)",
        valueExample: "WIND 240/4MPS",
        valueExplainZh: "风向/风速 (MPS或KT)，可能包含阵风、风向变化或跑道特定风息。",
        group: "body"
      },
      {
        code: "VIS",
        labelZh: "能见度",
        required: true,
        // 匹配 VIS 关键字
        pattern: "VIS\\s+([\\d\\w\\s]+)(?=\\s+RVR|\\s+CLD|\\s+T|\\s+QNH|\\s+MOD|\\s+HVY|\\s+FBL|\\s+NSC|\\s+CAVOK|$)",
        valueExample: "VIS 600M",
        valueExplainZh: "能见度数值，可能包含跑道分段数据 (TDZ, END)。",
        group: "body"
      },
      {
        code: "RVR",
        labelZh: "跑道视程",
        required: false,
        pattern: "RVR\\s+([\\w\\s/]+)(?=\\s+CLD|\\s+T|\\s+QNH|\\s+MOD|\\s+HVY|\\s+FBL|\\s+NSC|\\s+CAVOK|$)",
        valueExample: "RVR RWY 12 TDZ 1000M",
        valueExplainZh: "特定跑道的视程数据。",
        group: "body"
      },
      {
        code: "WEATHER",
        labelZh: "天气现象",
        required: false,
        // 天气现象没有统一前缀，通常位于 VIS/RVR 之后，CLD 之前。需要匹配特定代码。
        // 此处正则仅作示例，实际解析建议用字典匹配。
        pattern: "(?:FBL|MOD|HVY)?\\s*(?:DZ|RA|SN|SG|PL|DS|SS|FZDZ|FZRA|FG|BR|SA|DU|HZ|FU|VA|SQ|PO|FC|TS)(?:\\s+(?:FBL|MOD|HVY)?\\s*(?:DZ|RA|SN|SG|PL|DS|SS|FZDZ|FZRA|FG|BR|SA|DU|HZ|FU|VA|SQ|PO|FC|TS))*",
        valueExample: "MOD DZ FG",
        valueExplainZh: "当前发生的显著天气现象（如中度毛毛雨、雾）。",
        group: "body"
      },
      {
        code: "CLD",
        labelZh: "云层信息",
        required: true,
        pattern: "CLD\\s+([\\w\\s/]+)(?=\\s+T|\\s+QNH|\\s+TREND|$)",
        valueExample: "CLD SCT 300M OVC 600M",
        valueExplainZh: "云量（FEW/SCT/BKN/OVC）和云底高度。",
        group: "body"
      },
      {
        code: "T_DP",
        labelZh: "气温/露点",
        required: true,
        pattern: "(T(?:MS)?\\d{2}\\s+DP(?:MS)?\\d{2})",
        valueExample: "T17 DP16",
        valueExplainZh: "T代表气温，DP代表露点。MS表示负数。",
        group: "body"
      },
      {
        code: "QNH",
        labelZh: "修正海压",
        required: true,
        pattern: "QNH\\s+(\\d{4}HPA)",
        valueExample: "QNH 1018HPA",
        valueExplainZh: "修正海平面气压，单位 HPA。",
        group: "body"
      },
      {
        code: "TREND",
        labelZh: "趋势预报",
        required: false,
        pattern: "TREND\\s+(.+)$",
        valueExample: "TREND BECMG TL1700 VIS 800M FG BECMG AT1800 VIS 10KM NSW",
        valueExplainZh: "未来2小时内的天气变化趋势。",
        group: "footer"
      }
    ]
  }
};

module.exports = MessageConfig;