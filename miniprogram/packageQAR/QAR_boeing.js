/**
 * 飞行品质监控信息管理办法 - 波音系列 (Boeing) 完整数据
 * 来源: 民航规[2024]49号
 * 包含机型: B737, B747, B757, B767, B777, B787
 */

const boeingFlightQualityData = {
  meta: {
    documentNumber: "民航规〔2024〕49号",
    effectiveDate: "2025-01-01",
    category: "Boeing"
  },

  /**
   * 附件1: 各机型强制性飞行品质监控项目和标准
   */
  monitoringStandards: {
    "B737": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数"  },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许起飞重量，需随飞机信息上报局方基站"  },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null  },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为TOGA电门触发"  },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5 ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2；主轮离地时刻为主空地开关最后一个采样为“地”的时刻"  },
      { id: 6, item: "超过轮胎限制速度", parameter: "地速", phase: "地面", standard: ">195 kn", duration: null, remark: "B737-8、B737-900ER为 204 kn"  },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null  },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 46 m (150 ft)(含)", standard: ">45°", duration: null, remark: "注意：原表中分段包含 46m~122m 段亦为 >45°"  },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122m (400ft)至进近阶段457m (1500 ft)", standard: ">45°", duration: null, remark: null  },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">320 kn或>0.82 M", duration: null, remark: null  },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">235 kn", duration: null, remark: null  },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000 ft)", duration: null, remark: null  },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "VFE 需随飞机信息上报局方基站，具体值见附件2"  },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo 340 kn"  },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.82 M"  },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态下: >2.5g或<-1 g; 其他形态下: >2g或<0g", duration: "2s", remark: "g是标准自由落体加速度"  },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告"  },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500 ft)~15 m (50 ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null  },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457 m (1500 ft)~152 m (500 ft)(含)", standard: ">45°", duration: null, remark: "分段监控：152m-61m (>45°), 61m-15m (>45°)"  },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null  },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null  },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置,主空地开关", phase: "接地时刻", standard: "非30或40", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者VRTG变化量≥0.1，三个时刻中同时满足两个发生时刻"  },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2；接地时刻定义同上"  },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许着陆重量，需随飞机信息上报局方基站"  },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒至接地后5秒内", standard: ">2.2 g", duration: null, remark: "g是标准自由落体加速度"  },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速>60kn", standard: ">10°", duration: "2s", remark: "跑道参考航向为前轮接地后3秒至地速60节期间航向的平均数"  },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 29, item: "风切变警告", parameter: "反应式风切变警告,预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null  },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT < 200 C°", duration: "5s", remark: null  },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值为最低油量，具体值见附件2"  },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "< 15 m (50 ft)", duration: null, remark: "复飞时刻为飞行阶段为进近或者着陆阶段，TOGA电门触发"  },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null  },
      { id: 38, item: "迎角不一致", parameter: "左/右迎角", phase: "空中", standard: ">10°", duration: "10s", remark: null  },
      { id: 39, item: "空速不一致", parameter: "左/右空速", phase: "空中", standard: ">5 kn", duration: "5s", remark: null  },
      { id: 40, item: "高度不一致", parameter: "左/右气压高度", phase: "空中", standard: ">200 ft", duration: "5s", remark: "标准气压高度"  },
      { id: 41, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "具体值见附件2"  },
      { id: 42, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2"  },
      { id: 43, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2"  }
    ],

    "B747": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至达到起飞推力", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数"  },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许起飞重量"  },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到且空速大于100 kn", duration: null, remark: null  },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为TOGA电门触发"  },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2；主轮离地时刻为主空地开关最后一个采样为“地”的时刻"  },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: "B747-400: >204kn; B747-8: >204kn(起飞)/ >225kn(着陆)", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速"  },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft) (含)", standard: ">7.5°", duration: null, remark: null  },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null  },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122 m(400ft)至进近阶段457m(1500ft)", standard: ">45°", duration: null, remark: null  },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">320 kn或>0.82 M", duration: null, remark: null  },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">270 kn或>0.73 M", duration: null, remark: null  },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn或>0.73 M", duration: null, remark: null  },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000 ft)", duration: null, remark: null  },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "VFE 需随飞机信息上报局方基站，具体值见附件2"  },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo 365 kn"  },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "B747-400: 0.92 M; B747-8: 0.90 M"  },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: "2s", remark: "g是标准自由落体加速度"  },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告"  },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~ 15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null  },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°"  },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">7.5°", duration: null, remark: null  },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null  },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置,主空地开关", phase: "接地时刻", standard: "非30", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者VRTG变化量>0.1，三个时刻中同时满足两个发生时刻"  },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2；接地时刻定义同上"  },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.0 g", duration: null, remark: null  },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速 60kn", standard: ">10°", duration: "2s", remark: null  },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null  },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 ℃", duration: "5s", remark: null  },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值为最低油量，具体值见附件2"  },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻为飞行阶段为进近或者着陆阶段，TOGA电门触发"  },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null  },
      { id: 38, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "具体值见附件2"  },
      { id: 39, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2"  },
      { id: 40, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2"  }
    ],

    "B757": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: null  },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null  },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为TOGA电门触发或EPR大于1.1"  },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2"  },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速"  },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null  },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null  },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122m (400ft)以上至进近阶段457m(1500ft)", standard: ">45°", duration: null, remark: null  },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">270 kn >0.82 M", duration: null, remark: null  },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,起落架位置", phase: "收起落架时刻", standard: ">270 kn", duration: null, remark: null  },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn >0.82 M", duration: null, remark: null  },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000ft)", duration: null, remark: null  },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升/下降襟翼变化时刻", standard: ">VFE", duration: "2s", remark: "VFE 需随飞机信息上报，具体值见附件2"  },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo 360 kn"  },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo=0.86 M"  },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁: >2.5g/<-1g; 非光洁: >2g/<-0g", duration: "2s", remark: "g是标准自由落体加速度"  },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含Terrain、Pull up、Obstacle 的警告"  },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152m(500ft)~15m(50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null  },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°"  },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15m(50ft)至所有机轮接地", standard: ">10°", duration: null, remark: null  },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null  },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置,主空地开关", phase: "接地时刻", standard: "非25或30", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者VRTG变化量>0.1"  },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2"  },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.2 g", duration: null, remark: null  },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速 60kn", standard: ">10°", duration: "2s", remark: null  },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null  },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 C°", duration: "5s", remark: null  },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值见附件2"  },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻为TOGA电门触发或EPR大于1.1"  },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null  },
      { id: 38, item: "起飞EGT超温", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "见附件2"  },
      { id: 39, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "见附件2"  },
      { id: 40, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "见附件2"  }
    ],

    "B767": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: null  },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null  },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为TOGA电门触发"  },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度小于5英尺", standard: ">9.6°", duration: null, remark: "主轮离地时刻为主空地开关最后一个采样为“地”的时刻"  },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">204 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速"  },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null  },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null  },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122m (400ft)以上至进近阶段457m(1500ft)", standard: ">45°", duration: null, remark: null  },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6096 m (20000 ft)", duration: null, remark: "VFE需随飞机信息上报局方基站，参考值见下方VFE备注"  },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "参考值: 襟翼1: 250kn; 襟翼5: 230kn; 襟翼15: 210kn; 襟翼20:≥210kn; 襟翼25: 180kn; 襟翼30:≥170kn"  },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo 360 kn"  },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.86 M"  },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度"  },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告"  },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~ 15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null  },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°"  },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null  },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null  },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置,主空地开关", phase: "接地时刻", standard: "非25或30", duration: null, remark: "接地时刻定义为主空地开关第一个采样为“地”或扰流板伸出或VRTG变化量≥0.1"  },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">7.9°", duration: null, remark: "接地时刻定义同上"  },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒至接地后5秒内", standard: ">2.0 g", duration: null, remark: null  },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速 60 kn", standard: ">10°", duration: "2s", remark: null  },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null  },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 C°", duration: "5s", remark: null  },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<2350 kg", duration: "5s", remark: null  },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻为TOGA电门触发"  },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null  },
      { id: 38, item: "姿态不一致", parameter: "俯仰角", phase: "空中", standard: ">3°", duration: "10s", remark: null  },
      { id: 39, item: "空速不一致", parameter: "左/右空速", phase: "空中", standard: ">5 kn", duration: "5s", remark: null  },
      { id: 40, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞", standard: ">限制值", duration: null, remark: "PW: 650 °C; CF6: 960 °C"  },
      { id: 41, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "PW: N1 111.4%, N2 105.5%; CF6: N1 117.5%, N2 112.5%"  },
      { id: 42, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "PW: N1/N2 VIB 4.0/2.5; CF6: N1/N2 VIB 4.0"  }
    ],

    "B777": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: null  },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到且空速大于100 kn", duration: null, remark: null  },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为TOGA电门触发"  },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5 ft", standard: ">限制值", duration: null, remark: "B777-200/F: 10.25°/12.1°(压缩/伸展); B777-300ER(有尾橇): 7.7°/10.0°; B777-300ER(无尾橇): 7.9°/11.2°"  },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">204 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速"  },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null  },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null  },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122m (400ft)以上至进近阶段457m(1500ft)", standard: ">45°", duration: null, remark: null  },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6096 m (20000ft)", duration: null, remark: "VFE 需随飞机信息上报，参考值见下方VFE备注"  },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "参考值: 襟翼1: 265kn; 襟翼5: 245kn; 襟翼15: 230kn; 襟翼20: 225kn; 襟翼25: 200kn; 襟翼30: 180kn"  },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: null  },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.89 M"  },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度"  },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含Terrain、Pull up、Obstacle 的警告"  },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~ 15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null  },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°"  },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null  },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null  },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置,主空地开关", phase: "接地时刻", standard: "非25或30", duration: null, remark: "接地时刻定义为主空地开关第一个采样为“地”或扰流板伸出或VRTG变化量≥0.1"  },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "B777-200/F: 10.25°/12.1°(压缩/伸展); B777-300ER(有尾撬): 7.7°/8.9°; B777-300ER(无尾撬): 7.9°/9.7°"  },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒至接地后5秒内", standard: ">2.0 g", duration: null, remark: null  },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速≥60 kn", standard: ">10°", duration: "2s", remark: null  },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null  },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 C°", duration: "5s", remark: null  },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<3800 kg", duration: null, remark: null  },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻为TOGA电门触发"  },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null  },
      { id: 38, item: "迎角不一致", parameter: "左右迎角", phase: "空中", standard: ">10°", duration: "10s", remark: null  },
      { id: 40, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">1090 C°", duration: null, remark: null  },
      { id: 41, item: "发动机振动值", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "N1/N2 VIB: 4.0"  }
    ],

    "B787": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数"  },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null  },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为TOGA电门触发"  },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">限制值", duration: null, remark: "787-8: 11.2°; 787-9: 9.7°"  },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">204 kn(起飞) / >225 kn(着陆)", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速"  },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft) (含)", standard: ">10°", duration: null, remark: null  },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null  },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122 m(400ft)以上至进近阶段457m (1500ft)", standard: ">45°", duration: null, remark: null  },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn或>0.82 M", duration: null, remark: null  },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6096 m (20000 ft)", duration: null, remark: null  },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "参考值: 襟翼1:≥260kn; 襟翼5≥240kn; 襟翼10: 230kn; 襟翼15: 220kn; 襟翼17: 215kn; 襟翼18:≥215kn; 襟翼20:≥210kn; 襟翼25:≥190kn; 襟翼30:≥180kn"  },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: null  },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.9 M"  },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前 2s", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: "2s", remark: "g是标准自由落体加速度"  },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告"  },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft)~15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null  },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°"  },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null  },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null  },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置, 主空地开关", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻定义为主空地开关第一个采样为“地”或扰流板伸出或VRTG变化量≥0.1"  },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "787-8: 9.4°; 787-9: 7.8°"  },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报"  },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.0g", duration: null, remark: null  },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速>60 kn", standard: ">10°", duration: "2s", remark: null  },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null  },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 °C", duration: "5s", remark: null  },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null  },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<2500 kg", duration: "5 s", remark: null  },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null  },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "<15 m (50 ft)", duration: null, remark: "复飞时刻为TOGA电门触发"  },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null  },
      { id: 38, item: "迎角不一致", parameter: "左/右迎角", phase: "空中", standard: ">10°", duration: "10 s", remark: null  },
      { id: 39, item: "空速不一致", parameter: "左/右空速", phase: "空中", standard: ">5 kn", duration: "5 s", remark: null  },
      { id: 40, item: "高度不一致", parameter: "左/右气压高度", phase: "空中", standard: ">200 ft", duration: "5 s", remark: "标准气压高度"  },
      { id: 41, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "TRENT: 900 C°; GE: 1060℃"  },
      { id: 42, item: "发动机转速超限", parameter: "N1, N2, N3", phase: "全阶段", standard: ">限制值", duration: null, remark: "N1>101.5%; N2>103.5%; N3>101%"  },
      { id: 43, item: "发动机振动值超限", parameter: "左/右发N1、N2、N3 振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "N1 VIB>4; N2 VIB>4; N3 VIB>4"  }
    ]
  },

  /**
   * 附件2: 相关机型限制值 (Boeing部分)
   * 包含从附件1备注中提取的 B767/B777/B787 数据
   */
  limitations: {
    "B737": [
      {
        model: "B737-300/300F",
        takeoffEGT: "930°C",
        tailStrikeAngle: "离地:13.4°; 接地:10.8°",
        flapSpeed: "襟翼1: 230 kn; 襟翼2: 225 kn; 襟翼5: 210 kn; 襟翼10: 210 kn; 襟翼15: 195 kn; 襟翼25:≥190 kn; 襟翼30:≥185 kn; 襟翼40:≥158 kn",
        engineSpeed: "N1>106%; N2>105%",
        vibration: "N1>4个单位; N2>4个单位",
        minFuel: "1300 kg"
      },
      {
        model: "B737-400/400F",
        takeoffEGT: "930°C",
        tailStrikeAngle: "离地:11.4°; 接地:9.4°",
        flapSpeed: "襟翼1/2/5: 250 kn; 襟翼10: 215 kn; 襟翼15: 205 kn; 襟翼25:≥190 kn",
        engineSpeed: "N1>106%; N2>105%",
        vibration: "N1>4个单位; N2>4个单位",
        minFuel: "1300 kg"
      },
      {
        model: "B737-700/700F",
        takeoffEGT: "950°C",
        tailStrikeAngle: "离地:14.7°; 接地:12.3°",
        flapSpeed: "襟翼1/2/5: 250 kn; 襟翼10:≥210 kn; 襟翼15:≥195 kn; 襟翼25:≥180 kn; 襟翼30:≥165 kn; 襟翼40:≥156 kn; 备用:≥230 kn",
        engineSpeed: "N1>104%; N2>105%",
        vibration: "N1>4个单位; N2>4个单位",
        minFuel: "1100 kg"
      },
      {
        model: "B737-800/800F",
        takeoffEGT: "950°C",
        tailStrikeAngle: "离地:11°; 接地:9.3°",
        flapSpeed: "襟翼1/2/5: 250 kn; 襟翼10:≥210 kn; 襟翼15:≥200 kn; 襟翼25:≥190 kn; 襟翼30:≥175 kn; 襟翼40:≥162 kn; 备用:≥230 kn",
        engineSpeed: "N1>104%; N2>105%",
        vibration: "N1>4个单位; N2>4个单位",
        minFuel: "1200 kg"
      },
      {
        model: "B737-900ER",
        takeoffEGT: "950°C",
        tailStrikeAngle: "离地:10°; 接地:7.9°",
        flapSpeed: "同B737-800及 襟翼10: 205 kn; 襟翼25:≥195 kn; 襟翼30:≥180 kn; 襟翼40:≥170 kn",
        engineSpeed: "N1>104%; N2>105%",
        vibration: "N1>4个单位; N2>4个单位",
        minFuel: "1200 kg"
      },
      {
        model: "B737-8",
        takeoffEGT: "1038°C",
        tailStrikeAngle: "离地:11°; 接地:9.3°",
        flapSpeed: "襟翼1/2/5: 250 kn; 襟翼10:≥210 kn; 襟翼15:≥200 kn; 襟翼25:≥190 kn; 襟翼30:≥175 kn; 襟翼40:≥166 kn; 备用:≥230 kn",
        engineSpeed: "N1>104.3%; N2>117.5%",
        vibration: "N1>4个单位; N2>4个单位",
        minFuel: "1000 kg"
      } 
    ],

    "B747": [
      {
        model: "B747-400",
        takeoffEGT: "GE: 1060°C; PW: 650°C",
        tailStrikeAngle: "离地:12.5°; 接地:11°",
        flapSpeed: "襟翼1:≥280 kn; 襟翼5:≥260 kn; 襟翼10:≥240 kn; 襟翼20: 230 kn; 襟翼25: 205 kn; 襟翼30:≥180 kn",
        engineSpeed: "PW: N1>111.4%, N2>105.5%; GE: N1>107%, N2>117.5%",
        vibration: "PW: N1>4, N2>2.5; GE: N1>4, N2>4",
        minFuel: "4600 kg"
      },
      {
        model: "B747-400SF",
        takeoffEGT: "GE: 960°C",
        tailStrikeAngle: "离地:12.5°; 接地:11°",
        flapSpeed: "同-400",
        engineSpeed: "GE: N1>117.5%, N2>112.5%",
        vibration: "GE: N1>4, N2>4",
        minFuel: "4600 kg"
      },
      {
        model: "B747-8/400F/400ERF",
        takeoffEGT: "GE: 960°C / 1060°C",
        tailStrikeAngle: "8: 离地:12.1°/接地:10.2°; 400F: 离地:12.5°/接地:11°",
        flapSpeed: "襟翼1:≥280 kn(8型≥285); 襟翼5: 260 kn(8型265); 襟翼10:≥240 kn(8型245); 襟翼20:≥230 kn(8型235); 襟翼25: 205 kn(8型210); 襟翼30:≥180 kn",
        engineSpeed: "GE: N1>117.5%/107%; N2 112.5%/117.5%",
        vibration: "GE: N1>4; N2>4",
        minFuel: "4600 kg"
      } 
    ],

    "B757": [
      {
        model: "B757-200/200F",
        takeoffEGT: "850°C",
        tailStrikeAngle: "起飞:12.3°; 着陆:10.5°",
        flapSpeed: "襟翼1:≥240 kn; 襟翼5: 220 kn; 襟翼10: >210 kn; 襟翼20: >195 kn; 襟翼25: >190 kn; 襟翼30: ≥162 kn",
        engineSpeed: "起飞: N1>108.8%, N2>100.3%, N3>99%; 其他阶段: N1>108.4%, N2>98%, N3>95.8%",
        vibration: "N1>2.5个单位; N2>2.5个单位",
        minFuel: "1800 kg / 1900 kg"
      },
      {
        model: "B757-200SF",
        takeoffEGT: "850°C",
        tailStrikeAngle: "起飞:12.3°; 着陆:10.5°",
        flapSpeed: "同上",
        engineSpeed: "同上",
        vibration: "同上",
        minFuel: "2000 kg"
      } 
    ],

    "B767": [
      {
        model: "B767 (Source: Remarks)",
        takeoffEGT: "PW: 650°C; CF6: 960°C",
        tailStrikeAngle: "离地:9.6°; 接地:7.9°",
        flapSpeed: "襟翼1: 250kn; 襟翼5: 230kn; 襟翼15: 210kn; 襟翼20:≥210kn; 襟翼25: 180kn; 襟翼30:≥170kn",
        engineSpeed: "PW: N1 111.4%, N2 105.5%; CF6: N1 117.5%, N2 112.5%",
        vibration: "PW: N1/N2 4.0/2.5; CF6: N1/N2 4.0",
        minFuel: "2350 kg"
      } 
    ],

    "B777": [
      {
        model: "B777 (Source: Remarks)",
        takeoffEGT: "1090°C",
        tailStrikeAngle: "B777-200/F: 10.25°/12.1°; B777-300ER(有尾撬): 7.7°/8.9°; B777-300ER(无尾撬): 7.9°/9.7°",
        flapSpeed: "襟翼1: 265kn; 襟翼5: 245kn; 襟翼15: 230kn; 襟翼20: 225kn; 襟翼25: 200kn; 襟翼30: 180kn",
        engineSpeed: null,
        vibration: "N1/N2: 4.0",
        minFuel: "3800 kg"
      } 
    ],

    "B787": [
      {
        model: "B787 (Source: Remarks)",
        takeoffEGT: "TRENT: 900°C; GE: 1060°C",
        tailStrikeAngle: "787-8: 11.2°/9.4°; 787-9: 9.7°/7.8° (离地/接地)",
        flapSpeed: "襟翼1:≥260kn; 襟翼5≥240kn; 襟翼10: 230kn; 襟翼15: 220kn; 襟翼17: 215kn; 襟翼18:≥215kn; 襟翼20:≥210kn; 襟翼25:≥190kn; 襟翼30:≥180kn",
        engineSpeed: "N1>101.5%; N2>103.5%; N3>101%",
        vibration: "N1/N2/N3 > 4",
        minFuel: "2500 kg"
      } 
    ]
  }
};

module.exports = boeingFlightQualityData;