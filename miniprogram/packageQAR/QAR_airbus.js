/**
 * 飞行品质监控信息管理办法 - 空客系列 (Airbus) 完整数据
 * 来源: 民航规[2024]49号
 * 包含机型: A320系列, A330系列, A350系列
 * 数据涵盖: 附件1(监控项目) 和 附件2(限制值)
 */

const airbusFlightQualityData = {
  meta: {
    documentNumber: "民航规〔2024〕49号",
    effectiveDate: "2025-01-01",
    category: "Airbus"
  },

  /**
   * 附件1: 各机型强制性飞行品质监控项目和标准
   */
  monitoringStandards: {
    "A320": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数 " },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许起飞重量，需随飞机信息上报局方基站 " },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为油门杆前1秒小于“FLEX位”，当前秒大于或等于“FLEX位” " },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻,且无线电高度<5 ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2；主轮离地时刻为主空地开关最后一个采样为“地”的时刻 " },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速 " },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft) (含)", standard: ">10°", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122 m(400ft)以上至进近阶段457m (1500ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">280 kn或>0.67 M", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">220 kn或>0.54 M", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">250 kn或>0.6 M", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000 ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,RED WARN,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: "VFE并且探测到RED WARN", duration: null, remark: "VFE需随飞机信息上报局方基站，具体值见附件2 " },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速,RED WARN", phase: "空中", standard: ">Vmo 并且探测到RED WARN", duration: null, remark: "Vmo 350 kn " },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数,RED WARN", phase: "空中", standard: ">Mmo并且探测到RED WARN", duration: null, remark: "Mmo=0.82 M " },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度 " },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告 " },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~ 15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m (1500 ft) ~ 152 m (500 ft)(含)", standard: ">45°", duration: null, remark: "分段监控：152m-61m(>45°), 61m-15m(>45°) " },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻：主空地开关第一个采样为“地”或者扰流板伸出或者VRTG变化量>0.1，三个时刻中同时满足两个发生时刻 " },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: "2s", remark: "限制值为机型擦尾角度，具体值见附件2；接地时刻定义同上 " },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许着陆重量，需随飞机信息上报局方基站 " },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.2 g", duration: null, remark: "g是标准自由落体加速度 " },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速>60kn", standard: ">10°", duration: null, remark: "跑道参考航向为前轮接地后3秒至地速60节期间航向的平均数 " },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式风切变警告,预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "迎角平台", parameter: "Alpha Floor", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 32, item: "直接法则", parameter: "直接法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 33, item: "备用法则", parameter: "备用法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "失速警告", parameter: "失速警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 35, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT < 200 C°", duration: "5s", remark: null },
      { id: 36, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 37, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值为最低油量，具体值见附件2 " },
      { id: 38, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 39, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "< 15 m (50 ft)", duration: null, remark: "复飞时刻为飞行阶段为进近或者着陆阶段，油门杆前1秒小于“FLEX位”，当前秒大于或等于“FLEX位” " },
      { id: 40, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 41, item: "高度不一致", parameter: "左/右高度", phase: "空中", standard: ">500ft", duration: null, remark: "标准气压高度 " },
      { id: 42, item: "起飞EGT超温", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "具体值见附件2 " },
      { id: 43, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2 " },
      { id: 44, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2 " }
    ],

    "A330": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数 " },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许起飞重量 " },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为油门杆前1秒小于“FLEX位”，当前秒大于或等于“FLEX位” " },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5 ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2 " },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">204 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速 " },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft) (含)", standard: ">10°", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122m (400ft)以上至进近阶段457m (1500ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">250 kn或>0.55 M", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">250 kn或>0.55 M", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">250 kn或≥0.55 M", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000 ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,RED WARN,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: "VFE并且探测到RED WARN", duration: null, remark: "VFE需随飞机信息上报局方基站，具体值见附件2 " },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速,RED WARN", phase: "空中", standard: ">Vmo并且探测到RED WARN", duration: null, remark: "Vmo 330 kn " },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数,RED WARN", phase: "空中", standard: ">Mmo并且探测到RED WARN", duration: null, remark: "Mmo 0.86 M " },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度 " },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告 " },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152m(500ft)~15m(50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft)(含)", standard: ">45°", duration: null, remark: "分段: 457-152(>45), 152-61(>45), 61-15(>45) " },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15m(50ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻定义同上 " },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2 " },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报 " },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.0 g", duration: null, remark: null },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速>60kn", standard: ">10°", duration: "2s", remark: "跑道参考航向为前轮接地后3秒至地速60节期间航向的平均数 " },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "迎角平台", parameter: "Alpha Floor", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 32, item: "直接法则", parameter: "直接法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 33, item: "备用法则", parameter: "备用法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "失速警告", parameter: "失速警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 35, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT < 200℃", duration: "5s", remark: null },
      { id: 36, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 37, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值见附件2 " },
      { id: 38, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 39, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "<15 m (50 ft)", duration: null, remark: "复飞时刻定义同上 " },
      { id: 40, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 41, item: "高度不一致", parameter: "左/右高度", phase: "空中", standard: ">500 ft", duration: null, remark: "标准气压高度 " },
      { id: 42, item: "起飞EGT超温", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "见附件2 " },
      { id: 43, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "见附件2 " },
      { id: 44, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "见附件2 " }
    ],

    "A350": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数 " },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报 " },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为油门杆前1秒小于“FLEX位”，当前秒大于或等于“FLEX 位” " },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2 " },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速 " },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft) (含)", standard: ">10°", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升阶段122m (400ft)以上至进近阶段457m (1500ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">250 kn或>0.55 M", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">250 kn或>0.55 M", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">250 kn或>0.55 M", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000 ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,RED WARN,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: "VFE并且探测到RED WARN", duration: null, remark: "VFE需随飞机信息上报，值见附件2 " },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速,RED WARN", phase: "空中", standard: ">Vmo并且探测到RED WARN", duration: null, remark: "Vmo=340 kn " },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数,RED WARN", phase: "空中", standard: ">Mmo并且探测到RED WARN", duration: null, remark: "Mmo=0.89 M " },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁(GW<200t):>2.5g或<-1g; 光洁(GW≥200t):>2.25g或<-0.3g; 非光洁:>2g或<-0.2g", duration: null, remark: "g是标准自由落体加速度 " },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告 " },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~ 15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为>45° " },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻定义同上 " },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2 " },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报 " },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.0 g", duration: "2s", remark: null },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速>60kn", standard: ">10°", duration: "2s", remark: null },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "迎角平台", parameter: "Alpha Floor", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 32, item: "直接法则", parameter: "直接法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 33, item: "备用法则", parameter: "备用法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "失速警告", parameter: "失速警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 35, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT < 200 ℃", duration: "5s", remark: null },
      { id: 36, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 37, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值见附件2 " },
      { id: 38, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 39, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻定义同上 " },
      { id: 40, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 41, item: "高度不一致", parameter: "左/右高度", phase: "空中", standard: ">500 ft", duration: null, remark: "标准气压高度 " },
      { id: 42, item: "起飞EGT超温", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: "探测到", duration: null, remark: "具体值见附件2 " },
      { id: 43, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: "探测到", duration: null, remark: "具体值见附件2 " },
      { id: 44, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: "探测到", duration: null, remark: "具体值见附件2 " }
    ]
  },

  /**
   * 附件2: 相关机型限制值 (Airbus部分)
   */
  limitations: {
    "A320": [
      {
        model: "A319-112",
        takeoffEGT: "950°C",
        tailStrikeAngle: "离地:15.5°; 接地:13.9°",
        flapSpeed: "形态1:≥230 kn; 形态1+F:≥215 kn; 形态2:≥200 kn; 形态3:≥185 kn",
        engineSpeed: "CFM56: N1>104%; N2>105%",
        vibration: "CFM56: N1>6个单位(4MILS); N2>4.3个单位(1.7IPS)",
        minFuel: "1300 kg"
      },
      {
        model: "A319-132/115/131/133/153N",
        takeoffEGT: "635°C / 950°C / 635°C / 1060°C",
        tailStrikeAngle: "离地:15.5°; 接地:13.9°",
        flapSpeed: "同上",
        engineSpeed: "同上",
        vibration: "同上",
        minFuel: "1200 kg / 1000 kg"
      },
      {
        model: "A320-214/216",
        takeoffEGT: "950°C",
        tailStrikeAngle: "离地:13.5°; 接地:11.7°",
        flapSpeed: "形态4:≥177 kn",
        engineSpeed: "V2500: N1>100%; N2>100%",
        vibration: "V2500: N1>5个单位(1.5IPS); N2>5个单位(1.5IPS)",
        minFuel: "1300 kg / 1400 kg"
      },
      {
        model: "A320-232/251N/271N",
        takeoffEGT: "635°C / 1060°C / 1083°C",
        tailStrikeAngle: "离地:13.7°; 接地:11.7°",
        flapSpeed: "同上",
        engineSpeed: "LEAP-1A: N1>101%; N2>116.5%",
        vibration: "LEAP-1A: N1>6个单位(6MILS); N2>4.25个单位(1.7IPS)",
        minFuel: "1300 kg / 1000 kg"
      },
      {
        model: "A321-211/213/231",
        takeoffEGT: "950°C / 650°C",
        tailStrikeAngle: "离地:11.2°; 接地:9.7°",
        flapSpeed: "形态1:235 kn; 形态1+F: 225 kn; 形态2:≥215 kn; 形态3:195 kn; 形态4:≥190 kn",
        engineSpeed: null,
        vibration: null,
        minFuel: "1500 kg"
      },
      {
        model: "A321-271N/271NX/251NX/251N",
        takeoffEGT: "1083°C / 1060°C",
        tailStrikeAngle: "离地:11.5°; 接地:9.8°",
        flapSpeed: "形态1: 243 kn; 形态1+F:225 kn; 形态2: 215 kn; 形态3: 195 kn; 形态4: 186 kn",
        engineSpeed: "PW1100G: N1>100%, N2>100%; LEAP-1A: N1>101%, N2>116.5%",
        vibration: "PW1100G: N1>6个单位, N2>6个单位; LEAP-1A: N1>6个单位, N2>4.25个单位",
        minFuel: "1200 kg"
      }
    ],

    "A330": [
      {
        model: "A330-200/243F",
        takeoffEGT: null,
        tailStrikeAngle: "离地:16°; 接地:11.5°",
        flapSpeed: "形态1: 240 kn",
        engineSpeed: null,
        vibration: null,
        minFuel: "2600 kg"
      },
      {
        model: "A330-300",
        takeoffEGT: "900°C",
        tailStrikeAngle: "GE: 离地:14.2°/接地:10.1°; RR/PW: 离地:14.4°/接地:10.1°",
        flapSpeed: "形态1+F: 215 kn; 形态1: 205 kn; 形态2: 196 kn; 形态3: ≥186 kn; 形态 FULL: >180 kn",
        engineSpeed: "N1>99%; N2>105%; N3>100%",
        vibration: "N1>3.3个单位; N2>2.6个单位; N3>4个单位",
        minFuel: "2800 kg"
      }
    ],

    "A350": [
      {
        model: "A350-900",
        takeoffEGT: "900°C",
        tailStrikeAngle: "离地:12.4°; 接地:10.1°",
        flapSpeed: "形态1:≥278 kn; 形态1+F:>227 kn; 形态2:219 kn; 形态3:202 kn; 形态 FULL: 190 kn",
        engineSpeed: "N1>98.1%; N2>101.2%; N3>98.1%",
        vibration: "N3>5个单位 或 8秒 N1>8个单位 或 N2>8个单位",
        minFuel: "2700 kg"
      }
    ]
  }
};

module.exports = airbusFlightQualityData;