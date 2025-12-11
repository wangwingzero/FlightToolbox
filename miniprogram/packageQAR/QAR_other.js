/**
 * 飞行品质监控信息管理办法 - 其他机型完整数据
 * 来源: 民航规[2024]49号
 * 包含机型: CRJ900, ERJ190, ARJ21, C919, MA60
 */

const otherFlightQualityData = {
  meta: {
    documentNumber: "民航规〔2024〕49号",
    effectiveDate: "2025-01-01",
    category: "Regional & Domestic"
  },

  /**
   * 附件1: 各机型强制性飞行品质监控项目和标准
   */
  monitoringStandards: {
    
    // --- CRJ900  ---
    "CRJ900": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数" },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许起飞重量，需随飞机信息上报局方基站" },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为达到预设 N1 REF" },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2；主轮离地时刻为主空地开关最后一个采样为“地”的时刻" },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速" },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升122 m (400ft)以上至进近457m(1500ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">220 kn", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">200 kn", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">220 kn", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">4572 m (15000ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: null, remark: "VFE需随飞机信息上报局方基站，具体值见附件2" },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">335 kn", duration: null, remark: "Vmo 335 kn" },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">0.85 M", duration: null, remark: "Mmo 0.85 M" },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度" },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告" },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152m (500ft) ~ 15m (50ft.)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°" },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者 VRTG 变化量≥0.1" },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，具体值见附件2; 接地时刻定义同上" },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许着陆重量" },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.2 g", duration: null, remark: null },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速≥60 kn", standard: ">10°", duration: "2s", remark: "跑道参考航向为前轮接地后3秒至地速60节期间航向的平均数" },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "失速警告", parameter: "失速警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT < 200 °C", duration: "5s", remark: null },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值为最低油量，具体值见附件2" },
      { id: 35, item: "座舱失压警告", parameter: "座舱失压警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "<15 m (50 ft)", duration: "5s", remark: "复飞时刻为飞行阶段为进近或者着陆阶段，油门杆前一秒小于 50°，当前秒大于或等于50°" },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 38, item: "高度不一致", parameter: "左/右高度", phase: "空中", standard: ">200ft", duration: null, remark: "标准气压高度" },
      { id: 39, item: "起飞EGT超温", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "具体值见附件2" },
      { id: 40, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2" },
      { id: 41, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "具体值见附件2" }
    ],

    // --- ERJ190  ---
    "ERJ190": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数" },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "限制值为最大允许起飞重量" },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为飞机在地面，油门杆角度前一秒小于65°，当前秒大于或等于65°" },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">13.4°", duration: null, remark: "主轮离地时刻为主空地开关最后一个采样为“地”的时刻" },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速" },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升122 m (400ft)以上至进近457m (1500ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">265 kn", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">235 kn", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">265 kn", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "参考值: 形态1:≥230kn; 形态2:≥215kn; 形态3:≥200kn; 形态4:≥180kn; 形态5:≥180kn; 形态F: 165kn" },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo 320 kn" },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.82 M" },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度" },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含Terrain、Pull up、Obstacle的警告" },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°" },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "非全或5", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者 VRTG 变化量≥0.1" },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">10.8°", duration: null, remark: "接地时刻定义同上" },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报" },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.2 g", duration: null, remark: null },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速>60kn", standard: ">10°", duration: "2s", remark: null },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "抖杆警告", parameter: "抖杆警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 32, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 C°", duration: "5s", remark: null },
      { id: 33, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<900 kg", duration: "5s", remark: null },
      { id: 35, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 36, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻为TOGA电门触发" },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 38, item: "空速不一致", parameter: "左/右空速", phase: "空中", standard: ">5 kn", duration: "5s", remark: null },
      { id: 39, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">983℃", duration: null, remark: null },
      { id: 40, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "N1>100%; N2>100%" },
      { id: 41, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "N1 VIB>5; N2 VIB>5" }
    ],

    // --- ARJ21  ---
    "ARJ21": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数" },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报" },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置或起飞形态警告", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为当推力手柄设置在TO/GA位时" },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5ft", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2" },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速" },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10°", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "11 m (35 ft) ~ 122 m (400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "起飞爬升122 m (400ft)以上至进近457m(1500ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">270 kn或>0.68 M", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">220 kn", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">270 kn或>0.68 M", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6096 m (20000ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速,襟翼位置", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "VFE需随飞机信息上报，具体值见附件2" },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo=293 kn" },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.82 M" },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 非光洁形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度" },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告" },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500ft) ~15m (50ft)", standard: ">457 m/min (1500 ft/min)", duration: "2s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°" },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者 VRTG 变化量≥0.1" },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">限制值", duration: null, remark: "限制值为机型擦尾角度，见附件2; 接地时刻定义同上" },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "着陆阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报" },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒到接地后5秒内", standard: ">2.2 g", duration: null, remark: null },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向,跑道参考航向", phase: "前轮接地后3秒至地速≥60 kn", standard: ">10°", duration: "2s", remark: "跑道参考航向为前轮接地后3秒至地速60节期间航向的平均数" },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "迎角平台", parameter: "Alpha Floor", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 32, item: "直接法则", parameter: "直接法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 33, item: "备用法则", parameter: "备用法则", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "失速警告", parameter: "失速警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 35, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 ℃", duration: "5s", remark: null },
      { id: 36, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 37, item: "飞行中油量低", parameter: "总油量", phase: "全阶段", standard: "<限制值", duration: "5s", remark: "限制值见附件2" },
      { id: 38, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 39, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞时刻为TOGA电门触发" },
      { id: 40, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 41, item: "高度不一致", parameter: "左/右高度", phase: "空中", standard: ">200 ft", duration: "5s", remark: "标准气压高度" },
      { id: 42, item: "起飞EGT超温", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">限制值", duration: null, remark: "见附件2" },
      { id: 43, item: "发动机转速", parameter: "左/右发N1、N2", phase: "全阶段", standard: ">限制值", duration: null, remark: "见附件2" },
      { id: 44, item: "发动机振动值", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: ">限制值", duration: null, remark: "见附件2" }
    ],

    // --- C919  ---
    "C919": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "磁航向,前空地开关", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段地速60节至前轮离地过程中磁航向的平均数" },
      { id: 2, item: "超过最大起飞重量", parameter: "全重", phase: "起飞阶段", standard: ">限制值", duration: null, remark: "需随飞机信息上报" },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为油门杆前一秒小于“FLEX位”，当前秒大于或等于“FLEX位”" },
      { id: 5, item: "离地仰角大", parameter: "仰角,主空地开关", phase: "主轮离地时刻, 且无线电高度<5 ft", standard: ">13.5°", duration: null, remark: "主轮离地时刻为主空地开关最后一个采样为“地”的时刻" },
      { id: 6, item: "超过轮胎限制速度", parameter: "轮速或地速", phase: "地面", standard: ">195 kn", duration: null, remark: "有轮速首选监控轮速，无轮速采用地速" },
      { id: 7, item: "起飞坡度大", parameter: "坡度", phase: "0~11 m (35 ft)(含)", standard: ">10", duration: null, remark: null },
      { id: 8, item: "爬升坡度大", parameter: "坡度", phase: "46 m (150 ft) ~122 m(400 ft)(含)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "坡度大", parameter: "坡度", phase: "爬升122m(400 ft)至进近457m (1500 ft)", standard: ">45°", duration: null, remark: null },
      { id: 10, item: "超过起落架放下时限制速度", parameter: "空速,马赫数,起落架位置", phase: "起落架放下并锁定", standard: ">280 kn或>0.67 M", duration: null, remark: null },
      { id: 11, item: "收起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "收起落架时刻", standard: ">220 kn", duration: null, remark: null },
      { id: 12, item: "放起落架超过限制速度", parameter: "空速,马赫数,起落架位置", phase: "放起落架时刻", standard: ">250 kn", duration: null, remark: null },
      { id: 13, item: "超过襟翼限制高度", parameter: "高度,襟翼位置", phase: "襟翼放出", standard: ">6 096 m (20000 ft)", duration: null, remark: null },
      { id: 14, item: "超过襟翼标牌速度 (VFE)", parameter: "空速", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "参考值: 构型1:≥230kn; 构型1+F: 215kn; 构型2:≥200kn; 构型3:≥185kn; 构型 FULL: 177kn" },
      { id: 15, item: "超过最大操纵空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">Vmo", duration: "2s", remark: "Vmo=350 kn" },
      { id: 16, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">Mmo", duration: "2s", remark: "Mmo 0.82 M" },
      { id: 17, item: "空中垂直过载超限", parameter: "垂直过载", phase: "离地至接地前2秒", standard: "光洁形态: >2.5g或<-1g; 其他形态: >2g或<0g", duration: null, remark: "g是标准自由落体加速度" },
      { id: 18, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告" },
      { id: 19, item: "下降率大", parameter: "下降率", phase: "152 m (500 ft) ~ 15 m (50 ft)", standard: ">457 m/min (1500 ft/min)", duration: "2 s", remark: null },
      { id: 20, item: "进近坡度大", parameter: "坡度", phase: "457m(1500ft)~152m(500ft); 152m~61m; 61m~15m", standard: ">45°", duration: null, remark: "分段均为 >45°" },
      { id: 21, item: "着陆坡度大", parameter: "坡度", phase: "15 m (50 ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 22, item: "选择着陆构型晚", parameter: "起落架位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 23, item: "非着陆襟翼落地", parameter: "襟翼位置,主空地开关", phase: "接地时刻", standard: "探测到", duration: null, remark: "接地时刻为主空地开关第一个采样为“地”或者扰流板伸出或者 VRTG 变化量≥0.1" },
      { id: 24, item: "着陆仰角大", parameter: "仰角,主空地开关", phase: "接地时刻前1秒至前轮接地", standard: ">11.6°", duration: null, remark: "接地时刻定义同上" },
      { id: 25, item: "超过最大着陆重量", parameter: "全重", phase: "接地前2秒至接地后5秒内", standard: ">限制值", duration: null, remark: "需随飞机信息上报" },
      { id: 26, item: "着陆垂直过载大", parameter: "垂直过载", phase: "接地前2秒至接地后5秒内", standard: ">2.2 g", duration: null, remark: null },
      { id: 27, item: "着陆滑跑方向不稳定", parameter: "磁航向", phase: "前轮接地后3秒至地速≥60 kn", standard: ">10°", duration: "2 s", remark: "跑道参考航向为前轮接地后3秒至地速60节期间航向的平均数" },
      { id: 28, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "<457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 30, item: "TCAS 警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "发动机空中停车", parameter: "N1, N2, EGT", phase: "空中", standard: "N1<30%和N2<20%和EGT 200 C°", duration: "5s", remark: null },
      { id: 32, item: "发动机火警", parameter: "发动机火警", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 33, item: "飞行中油量低", parameter: "总油量", phase: "空中", standard: "<1100 kg", duration: "5s", remark: null },
      { id: 34, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 35, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: "复飞推力时刻为油门杆角度大于70度" },
      { id: 36, item: "失速警告", parameter: "失速警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 37, item: "俯仰超限", parameter: "仰角", phase: "空中", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 38, item: "起飞EGT超限", parameter: "左/右发EGT", phase: "起飞5分钟内", standard: ">1065 C°", duration: null, remark: null },
      { id: 39, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "起飞推力时", standard: "N1>101 %, N2 116.5%", duration: null, remark: null },
      { id: 40, item: "发动机振动值超限", parameter: "左/右发N1、N2振动值", phase: "全阶段", standard: "N1 VIB 6, N2 VIB 4.25", duration: null, remark: null }
    ],

    // --- MA60  ---
    "MA60": [
      { id: 1, item: "起飞滑跑方向不稳定", parameter: "空速,磁航向", phase: "接通起飞马力至前轮离地", standard: ">8°", duration: "2s", remark: "跑道参考航向为起飞阶段空速>50kn至前轮离地过程中磁航向的平均数" },
      { id: 2, item: "超过轮胎限制速度", parameter: "地速,前起轮载,主起轮载", phase: "地面", standard: ">139 kn", duration: null, remark: null },
      { id: 3, item: "大速度中断起飞", parameter: "空速", phase: "起飞阶段", standard: "探测到,且空速大于100 kn", duration: null, remark: null },
      { id: 4, item: "起飞形态警告", parameter: "襟翼位置", phase: "起飞推力时刻", standard: "探测到", duration: null, remark: "起飞推力时刻为地面功率杆大于63°时" },
      { id: 5, item: "离地仰角大", parameter: "仰角,主起轮载,左/右外轮轮速", phase: "主轮离地时刻", standard: ">11°", duration: null, remark: "主轮离地时刻为左/右外轮轮速在起飞阶段达到最大值时" },
      { id: 6, item: "起飞坡度大", parameter: "坡度", phase: "0~11m (35ft)(含)", standard: ">10°", duration: null, remark: null },
      { id: 7, item: "爬升坡度大", parameter: "坡度", phase: "35 ft~150 ft; 150 ft~400 ft", standard: ">45°", duration: null, remark: null },
      { id: 8, item: "坡度大", parameter: "坡度", phase: "起飞爬升122 m (400ft)以上至进近305m (1000ft)", standard: ">45°", duration: null, remark: null },
      { id: 9, item: "收起落架速度大 (VLO)", parameter: "空速,起落架收", phase: "收起落架时刻", standard: ">159 kn", duration: null, remark: null },
      { id: 10, item: "放起落架速度大 (VLE)", parameter: "空速,起落架放", phase: "放起落架时刻", standard: ">159 kn", duration: null, remark: null },
      { id: 11, item: "超过襟翼标牌速度 (VFE)", parameter: "空速", phase: "爬升阶段襟翼开始变化时刻，下降阶段襟翼到位时刻", standard: ">VFE", duration: "2s", remark: "VFE 需随飞机信息上报，参考值: 5°: 167kn; 15°: 159kn; 30°: 159kn" },
      { id: 12, item: "超过最大飞行空速 (Vmo)", parameter: "空速", phase: "空中", standard: ">220 kn", duration: "2s", remark: null },
      { id: 13, item: "超过最大马赫数 (Mmo)", parameter: "马赫数", phase: "空中", standard: ">0.52 M", duration: "2s", remark: null },
      { id: 14, item: "空中垂直过载大", parameter: "垂直加速度", phase: "离地至接地前 2s", standard: ">2.4 g", duration: null, remark: "30H时垂直加速度+1" },
      { id: 15, item: "下降率大", parameter: "下降率", phase: "500 ft~50 ft", standard: ">1300 ft/min", duration: "2s", remark: null },
      { id: 16, item: "进近坡度大", parameter: "坡度", phase: "1000ft~500ft; 500ft~200ft; 200ft~50ft", standard: ">45°", duration: null, remark: "各段均为 >45°" },
      { id: 17, item: "着陆坡度大", parameter: "坡度", phase: "15m(50ft)至所有机轮接地", standard: ">10°", duration: null, remark: null },
      { id: 18, item: "选择着陆构型晚", parameter: "轮載位置、襟翼位置", phase: "<152m (500ft)", standard: "探测到", duration: null, remark: null },
      { id: 19, item: "非着陆构型落地", parameter: "襟翼位置", phase: "接地时刻", standard: "<15°", duration: "2s", remark: "接地时刻为左/右外轮轮速在着陆阶段第一次大于3节时" },
      { id: 20, item: "着陆仰角大", parameter: "仰角,主起轮载,左/右外轮轮速", phase: "接地时刻前1秒至前轮接地", standard: ">11°", duration: null, remark: "接地时刻定义同上" },
      { id: 21, item: "着陆垂直过载大", parameter: "主起轮载,左/右外轮轮速,垂直加速度", phase: "接地前2s至接地后5s內", standard: ">2.2 g", duration: null, remark: "30H时垂直加速度+1" },
      { id: 22, item: "着陆滑跑方向不稳定", parameter: "前起轮载,空速,磁航向", phase: "前轮接地3至空速>60 kn", standard: ">10°", duration: null, remark: "跑道参考航向为前轮接地后3秒至空速60节期间航向的平均数" },
      { id: 23, item: "烟雾警告", parameter: "货舱、电子舱烟雾警告", phase: "全阶段", standard: "探测到", duration: null, remark: null },
      { id: 24, item: "近地警告(GPWS)", parameter: "近地警告", phase: "空中", standard: "探测到", duration: null, remark: "包含 Terrain、Pull up、Obstacle 的警告" },
      { id: 25, item: "滑油温度过高", parameter: "左/右发滑油温度", phase: "全阶段", standard: ">125 °C", duration: null, remark: null },
      { id: 26, item: "超过最大表速", parameter: "空速", phase: "空中", standard: ">223 kn", duration: "2s", remark: null },
      { id: 27, item: "抖杆警告", parameter: "临界迎角", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 28, item: "座舱高度警告", parameter: "座舱高度警告", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 29, item: "发动机空中停车", parameter: "Nhl, Nhr, ITT", phase: "空中", standard: "Nhl 74%或Nhr≤74%; 和 ITT<300 C°", duration: "5s", remark: null },
      { id: 30, item: "发动机火警", parameter: "发动机火警", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 31, item: "低燃油量警告", parameter: "燃油剩余警告", phase: "空中", standard: "探测到", duration: "5s", remark: null },
      { id: 32, item: "复飞", parameter: "无线电高度", phase: "复飞时刻", standard: "15 m (50 ft)", duration: null, remark: null },
      { id: 33, item: "TCAS RA警告", parameter: "TCAS RA", phase: "空中", standard: "探测到", duration: null, remark: null },
      { id: 34, item: "风切变警告", parameter: "反应式/预测式风切变警告", phase: "457 m (1500 ft)", standard: "探测到", duration: null, remark: null },
      { id: 35, item: "俯仰超限", parameter: "仰角", phase: "空地电门=AIR", standard: ">25°或<-10°", duration: null, remark: null },
      { id: 36, item: "空速不一致", parameter: "左/右空速", phase: "空中", standard: ">5 kn", duration: "5 s", remark: null },
      { id: 37, item: "高度不一致", parameter: "左/右高度", phase: "空中", standard: ">200 ft", duration: "5 s", remark: "标准气压高度" },
      { id: 38, item: "起飞ITT超限", parameter: "左/右发涡轮温度", phase: "起飞阶段", standard: "≥800 C°", duration: "3s", remark: "任一发涡轮温度超限" },
      { id: 39, item: "发动机转速超限", parameter: "左/右发N1、N2", phase: "起飞阶段", standard: "N1>104.6%; N2>104.6%", duration: null, remark: null }
    ]
  },

  /**
   * 附件2: 相关机型限制值 (其他机型)
   * 注: ERJ190, C919, MA60 的限制值提取自附件1的备注信息
   */
  limitations: {
    "CRJ900": [
      {
        model: "CRJ900",
        takeoffEGT: "963.5°C (ITT)",
        tailStrikeAngle: "离地:11.7°; 接地:11.2°",
        flapSpeed: "襟翼1/8/20: >230 kn; 襟翼30: >185 kn; 襟翼45: >170 kn",
        engineSpeed: "N1>99.5%; N2≥99.4%",
        vibration: "N1>1.75个单位; N2>1.1个单位",
        minFuel: "850 kg"
      }
    ],

    "ARJ21": [
      {
        model: "ARJ21",
        takeoffEGT: "951°C (ITT)",
        tailStrikeAngle: "离地:14.2°; 接地:12.3°",
        flapSpeed: "襟翼15:≥230 kn; 襟翼25: 200 kn; 襟翼41.5: 180 kn",
        engineSpeed: "N1>106.2%; N2>105%",
        vibration: "N1>4个单位; N2>4个单位 (启动>5)",
        minFuel: "950 kg"
      }
    ],

    "ERJ190": [
      {
        model: "ERJ190 (Source: Remarks)",
        takeoffEGT: "983°C",
        tailStrikeAngle: "离地: 13.4°; 接地: 10.8°",
        flapSpeed: "形态1:≥230kn; 形态2:≥215kn; 形态3:≥200kn; 形态4:≥180kn; 形态5:≥180kn; 形态F: 165kn",
        engineSpeed: "N1>100%; N2>100%",
        vibration: "N1 VIB>5; N2 VIB>5",
        minFuel: "900 kg"
      }
    ],

    "C919": [
      {
        model: "C919 (Source: Remarks)",
        takeoffEGT: "1065°C",
        tailStrikeAngle: "离地: 13.5°; 接地: 11.6°",
        flapSpeed: "构型1:≥230kn; 构型1+F: 215kn; 构型2:≥200kn; 构型3:≥185kn; 构型 FULL: 177kn",
        engineSpeed: "N1>101%; N2>116.5%",
        vibration: "N1 VIB 6; N2 VIB 4.25",
        minFuel: "1100 kg"
      }
    ],

    "MA60": [
      {
        model: "MA60 (Source: Remarks)",
        takeoffEGT: "800°C (ITT)",
        tailStrikeAngle: "离地: 11°; 接地: 11°",
        flapSpeed: "5°: 167kn; 15°: 159kn; 30°: 159kn",
        engineSpeed: "N1>104.6%; N2>104.6%",
        vibration: null,
        minFuel: "燃油剩余警告探测到"
      }
    ]
  }
};

module.exports = otherFlightQualityData;