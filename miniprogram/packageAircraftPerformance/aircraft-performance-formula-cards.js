// 飞机性能“公式卡片”数据
// 用于小程序重构：优先将相互有关系的公式聚合成一张卡片

const aircraftPerformanceFormulaCards = [
 // =====================================
 // 原始卡片包 (已清理)
 // =====================================
 {
   id: "weights-tow-lw-zfw",
   primaryType: "formula",
   titleZh: "起飞重量、着陆重量与零油重量关系",
   summaryZh:
     "干操作重量(DOW)、商载、储备油和航程油共同构成了起飞重量(TOW)、着陆重量(LW)和零油重量(ZFW)，同时实际着陆重量还需满足最大结构着陆重量(MLW)的限制。",
   keywordsZh: ["TOW", "LW", "ZFW", "MLW", "起飞重量", "着陆重量", "零油重量"],
   keywordsEn: ["TOW", "LW", "ZFW", "MLW", "weights"],
   tags: ["基础概念", "重量"],
   contentZh:
     "重量概念：\n起飞重量 (TOW)：由干操作重量、商载和全部燃油构成。\n着陆重量 (LW)：等于起飞重量减去航程油。\n零油重量 (ZFW)：为总商载与干操作重量之和。\n重量限制：实际着陆重量不得超过最大结构着陆重量 (MLW)，这也反过来限制了起飞重量的上限。",
   formulas: [
     {
       id: "tow-equation",
       latex: "TOW = DOW + 商载 + 储备油 + 航程油",
       explainZh: [
         "TOW：起飞重量",
         "DOW：干操作重量",
         "商载：旅客和货物",
         "储备油：各类法规要求的储备油量",
         "航程油：完成航程所需的油量"
       ]
     },
     {
       id: "lw-equation",
       latex: "LW = DOW + 商载 + 储备油",
       explainZh: ["LW：着陆重量，等于零油重量(ZFW)加上储备油"]
     },
     {
       id: "zfw-equation",
       latex: "ZFW = DOW + 商载",
       explainZh: ["ZFW：零油重量，不包括任何可用燃油"]
     },
     {
       id: "actual-lw-mlw",
       latex: "实际 LW = TOW - 航程油 <= MLW",
       explainZh: [
         "实际 LW：预计的实际着陆重量",
         "必须不超过最大结构着陆重量(MLW)"
       ]
     },
     {
       id: "actual-tow-mlw",
       latex: "实际 TOW <= MLW + 航程油",
       explainZh: [
         "与上一式等价的写法",
         "起飞重量上限等于最大结构着陆重量(MLW)加上预计航程油量"
       ]
     }
   ],
   figures: []
 },
 {
   id: "tod-dry-wet",
   primaryType: "formula",
   titleZh: "干跑道/湿跑道起飞距离 TOD",
   summaryZh:
     "干跑道起飞距离(TOD)取“一台发动机不工作距离”和“所有发动机工作距离的115%”中的较大值；湿跑道起飞距离再在此基础上与“一台发动机不工作时的湿跑道距离”比较取最大值。最终起飞距离不得超过可用起飞距离(TODA)。",
   keywordsZh: ["起飞距离", "TOD", "TODA", "干跑道", "湿跑道"],
   keywordsEn: ["takeoff distance", "TOD", "TODA"],
   tags: ["起飞", "限制"],
   contentZh:
     "起飞距离定义：\n干跑道：所有发动机工作时的起飞距离 (TODN) 乘以 1.15，并与一台发动机不工作时的起飞距离 (TODN-1) 取最大值得到干跑道 TOD。\n湿跑道：再将干跑道 TOD 与一台发动机不工作时的湿跑道距离 (TODN-1, wet) 比较取最大值，得到湿跑道 TOD。\n距离限制：无论何种道面，计算出的起飞距离都必须小于或等于可用起飞距离 (TODA)。",
   formulas: [
     {
       id: "tod-dry",
       latex: "TOD_干 = max{ TOD_{N-1,干} , 1.15 * TOD_{N,干} }",
       explainZh: [
         "TODN-1,干：一台发动机不工作时，干跑道起飞距离",
         "TODN,干：所有发动机都工作时，干跑道起飞距离",
         "1.15：法规要求的安全系数"
       ]
     },
     {
       id: "tod-wet",
       latex: "TOD_湿 = max{ TOD_干 , TOD_{N-1,湿} }",
       explainZh: [
         "TODN-1,湿：一台发动机不工作时，湿跑道起飞距离",
         "TOD湿：湿跑道起飞距离，至少不小于干跑道时的距离"
       ]
     },
     {
       id: "tod-toda",
       latex: "TOD <= TODA",
       explainZh: [
         "TOD：选定工况下的起飞距离",
         "TODA：可用起飞距离 (TORA加净空道，且净空道长度不得超过TORA的一半)"
       ]
     }
   ],
   figures: []
 },
 {
   id: "stall-speed-relationships",
   primaryType: "formula",
   titleZh: "失速速度 VS / VSR / VS1g 关系",
   summaryZh:
     "失速速度相关定义包括：VS1g(1g失速速度)、VSR(参考失速速度)和VS(常规失速速度)。VS1g对应最大升力系数且过载系数为1，VSR为取证用的参考速度。在此基础上，法规定义了V2min等关键速度的最低裕度。",
   keywordsZh: ["失速速度", "VS", "VSR", "VS1g", "V2min"],
   keywordsEn: ["stall speed", "VS", "VSR", "VS1g"],
   tags: ["基础概念", "限制"],
   contentZh:
     "失速速度定义：\nVSR：由最大升力系数对应的速度 VCLMAX 和该点的法向过载系数 nzw 确定，是取证的基础。\nVS1g：在空客运行文件中，参考失速速度 VSR 被称为 VS1g。\n早期机型 VS：对于按 VS 取证的机型，VS 与 VS1g 存在固定比例关系。\nV2min：基于这些基准速度，法规规定了起飞爬升速度 V2min 等的下限。",
   formulas: [
     {
       id: "vsr-def",
       latex: "VSR >= VCLMAX / sqrt(nzw)",
       explainZh: [
         "VSR：参考失速速度",
         "VCLMAX：对应最大升力系数的速度 (即 VS1g)",
         "nzw：在VCLMAX处的法向过载系数"
       ]
     },
     {
       id: "vsr-vs1g",
       latex: "VSR = VS1g",
       explainZh: ["在空客运行文件中，参考失速速度VSR被称为VS1g"]
     },
     {
       id: "vs-vs1g",
       latex: "VS = 0.94 * VS1g",
       explainZh: ["JAR规章中VS与VS1g的关系，以确保新旧规章取证机型的连续性"]
     },
     {
       id: "v2min-vsr",
       latex: "V2min >= 1.13 * VSR",
       explainZh: ["涡喷发动机飞机的最小起飞爬升速度V2min至少为1.13倍VSR"]
     },
     {
       id: "v2-vs1g",
       latex: "V2 >= 1.13 * VS1g",
       explainZh: ["对于按VS1g取证的电传操纵飞机，V2以1.13倍VS1g为下限"]
     },
     {
       id: "v2-vs-a300",
       latex: "V2 >= 1.2 * VS (A300/A310)",
       explainZh: ["对于按VS取证的机型(A300/A310)，V2不得低于1.2倍VS"]
     }
   ],
   figures: []
 },
 {
   id: "key-takeoff-speeds",
   primaryType: "formula",
   titleZh: "起飞阶段关键速度之间的关系",
   summaryZh:
     "起飞阶段，VMCG、VEF、V1和VMBE之间存在明确的顺序限制；抬轮速度VR和起飞爬升速度V2必须高于空中的最小控制速度VMCA，同时离地速度VLOF受轮胎最大速度VTIRE的限制。",
   keywordsZh: ["VMCG", "V1", "VMBE", "VR", "V2", "VMCA", "VLOF", "VTIRE"],
   keywordsEn: ["VMCG", "V1", "VMBE", "VR", "V2", "VMCA", "VLOF", "VTIRE"],
   tags: ["起飞", "限制"],
   contentZh:
     "速度关系概览：\n地面速度顺序：地面的最小控制速度 VMCG 必须低于发动机故障速度 VEF，VEF 低于决断速度 V1，而 V1 不得超过最大刹车能量速度 VMBE。\n空中控制速度：抬轮速度 VR 和起飞爬升速度 V2 均需高于空中的最小控制速度 VMCA，以保证单发情况下的操纵性和失速裕度。\n轮胎速度限制：离地速度 VLOF 对应的地速不得超过轮胎最大允许速度 VTIRE。",
   formulas: [
     {
       id: "vmcg-vef-v1-vmbe",
       latex: "VMCG <= VEF < V1 <= VMBE",
       explainZh: ["发动机故障识别和中断起飞情景下的速度顺序关系"]
     },
     {
       id: "vr-vmca",
       latex: "VR >= 1.05 * VMCA",
       explainZh: ["抬轮速度必须至少为空中的最小控制速度VMCA的1.05倍"]
     },
     {
       id: "v2-vmca",
       latex: "V2 >= 1.1 * VMCA",
       explainZh: ["起飞爬升速度V2至少为VMCA的1.1倍"]
     },
     {
       id: "vlof-vtire",
       latex: "VLOF <= VTIRE",
       explainZh: ["离地速度对应的地速必须不超过轮胎最大允许速度VTIRE"]
     }
   ],
   figures: []
 },
 {
   id: "approach-landing-speeds",
   primaryType: "formula",
   titleZh: "进近与着陆速度之间的关系",
   summaryZh:
     "最小可选速度VLS与VS1g有固定倍数关系；最后进近速度VAPP不应低于VLS，并在此基础上增加风修正；基准速度VREF在正常情况下等于着陆形态下的VLS，若有系统失效则在VREF基础上增加相应的速度增量。",
   keywordsZh: ["VLS", "VAPP", "VREF", "GSmini"],
   keywordsEn: ["VLS", "VAPP", "VREF", "GSmini"],
   tags: ["进近", "着陆", "限制"],
   contentZh:
     "进近与着陆速度：\nVLS：飞行中飞行员不应选择低于最小可选速度 VLS 的速度；对于电传操纵飞机，VLS 为相应形态下 1.23 倍的 VS1g。\nVAPP：最后进近速度 VAPP 至少不小于 VLS，并在此基础上加上一定范围内的风修正。\nGSmini / VAPP TARGET：FMGS 定义 GSmini 和 VAPP TARGET，用于在变化的风况下管理飞机的能量状态。",
   formulas: [
     {
       id: "vls-vs1g",
       latex: "VLS >= 1.23 * VS1g",
       explainZh: ["对于电传操纵飞机，VLS至少为当前形态下1.23倍的1g失速速度"]
     },
     {
       id: "vls-vs-a300",
       latex: "VLS = 1.3 * VS (A300/A310)",
       explainZh: ["对于早期机型，VLS以VS为基准"]
     },
     {
       id: "vapp-min",
       latex: "VAPP >= VLS",
       explainZh: ["最后进近速度不得低于最小可选速度VLS"]
     },
     {
       id: "vapp-def",
       latex: "VAPP = VLS + 风修正",
       explainZh: ["风修正值通常限制在5–15 kt之间"]
     },
     {
       id: "gsmini",
       latex: "GSmini = VAPP - 塔台报告的风",
       explainZh: ["GSmini：考虑塔台报告的风后得到的最小地速目标"]
     },
     {
       id: "vapp-target",
       latex: "VAPP_{TARGET} = GSmini + 当前顶风分量",
       explainZh: ["FMGS根据当前顶风分量动态调整的进近速度目标"]
     },
     {
       id: "vref",
       latex: "VREF = 全形态的VLS",
       explainZh: ["基准速度VREF，等于全形态下的VLS"]
     },
     {
       id: "vapp-inop",
       latex: "VAPP = VREF + ΔV_{不工作}",
       explainZh: ["有系统不工作影响着陆性能时，在VREF基础上加上规定的速度增量"]
     }
   ],
   figures: []
 },
 {
   id: "load-factor-and-apparent-weight",
   primaryType: "formula",
   titleZh: "过载系数与表现重力",
   summaryZh:
     "过载系数nz定义为升力与飞机重力之比，它决定了飞机在机动或紊流中所承受的结构载荷；当nz不等于1时，飞机的表现重力与其实际重力不同。",
   keywordsZh: ["过载系数", "表现重力", "nz", "载荷"],
   keywordsEn: ["load factor", "apparent weight", "nz"],
   tags: ["基础概念", "飞行力学"],
   contentZh:
     "过载系数定义：\n过载系数 nz：升力与飞机重力之比。\n表现重力：当 nz 不等于 1 时，飞机的表现重力与其实际重力不同。",
   formulas: [
     {
       id: "nz-def",
       latex: "nz = 升力 / 重力",
       explainZh: ["过载系数是作用在飞机上的空气动力分量与飞机重力之比"]
     },
     {
       id: "apparent-weight",
       latex: "表现重力 = nz * m * g = 升力",
       explainZh: [
         "m：质量，g：重力加速度",
         "当nz变化时，飞机的表现重力也随之改变"
       ]
     }
   ],
   figures: []
 },
 {
   id: "lift-drag-and-mach",
   primaryType: "formula",
   titleZh: "升力、阻力、马赫数与迎角关系",
   summaryZh:
     "标准升力/阻力方程将升力、阻力与速度、机翼面积和气动系数联系起来，并可改写为马赫数形式；在失速前的线性区间内，升力系数随迎角增加而增加，为保持升力等于重力，速度必须相应降低。",
   keywordsZh: ["升力", "阻力", "CL", "CD", "马赫数", "迎角"],
   keywordsEn: ["lift", "drag", "CL", "CD", "Mach", "angle of attack"],
   tags: ["飞行力学", "基础公式"],
   contentZh:
     "升力和阻力方程：\n升力方程：L = 0.5 * ρ * S * TAS^2 * CL。\n阻力方程：D = 0.5 * ρ * S * TAS^2 * CD。\n马赫数形式：升力和阻力也可以表示为静压和马赫数的函数。\n升力系数和迎角：在失速前的线性区间内，升力系数 CL 随迎角近似线性增加，为保持升力与重力平衡，真空速 TAS 必须相应降低。",
   formulas: [
     {
       id: "lift-standard",
       latex: "L = 重力 = 0.5 * ρ * S * TAS^2 * CL",
       explainZh: ["标准升力方程 (稳定平飞时)"]
     },
     {
       id: "drag-standard",
       latex: "D = 推力 = 0.5 * ρ * S * TAS^2 * CD",
       explainZh: ["标准阻力方程 (稳定平飞时)"]
     },
     {
       id: "lift-mach",
       latex: "重量 = 0.7 * Ps * S * M^2 * CL",
       explainZh: ["升力方程的马赫数形式，系数0.7为工程近似"]
     },
     {
       id: "drag-mach",
       latex: "推力 = 0.7 * Ps * S * M^2 * CD",
       explainZh: ["阻力/所需推力的马赫数形式"]
     },
     {
       id: "cl-alpha",
       latex: "迎角 α 增大 => CL 增大 (失速前)",
       explainZh: ["在失速前的线性区间内，升力系数随迎角增加而增加"]
     },
     {
       id: "cl-tas",
       latex: "重力 = 0.5 * ρ * S * TAS^2 * CL = 常数",
       explainZh: ["稳定平飞时，重力、空气密度、翼面积在短时间内近似不变"]
     },
     {
       id: "cl-tas-tradeoff",
       latex: "CL 增大 => TAS 减小 (重力,ρ,S 固定)",
       explainZh: ["为保持升力与重力平衡，CL增大时TAS必须降低"]
     }
   ],
   figures: []
 },
 {
   id: "climb-descent-performance",
   primaryType: "formula",
   titleZh: "爬升/下降梯度与爬升/下降率",
   summaryZh:
     "在小角度近似下，爬升/下降梯度(γ)可表示为(推力-阻力)/重力，或推重比与升阻比(L/D)的组合；爬升率(RC)等于真空速乘以爬升梯度，下降率(RD)则与真空速和升阻比成反比。",
   keywordsZh: ["爬升梯度", "下降梯度", "RC", "RD", "L/D"],
   keywordsEn: ["climb gradient", "descent gradient", "RC", "RD", "L/D"],
   tags: ["飞行力学", "爬升", "下降"],
   contentZh:
     "爬升/下降梯度：\n小角度近似：γ ≈ sin(γ) ≈ tan(γ)。\n梯度公式：γ = (推力 - 阻力) / 重力，或 γ = 推重比 - 1 / (L/D)。\n爬升率和下降率：RC = TAS * γ，RD = - TAS / (L/D)。",
   formulas: [
     {
       id: "gamma-basic",
       latex: "γ_{rad} = (推力 - 阻力) / 重力",
       explainZh: ["以弧度表示的爬升/下降梯度"]
     },
     {
       id: "gamma-ld",
       latex: "γ_{rad} = 推力/重力 - 1/(L/D)",
       explainZh: ["爬升梯度由推重比和升阻比共同决定"]
     },
     {
       id: "gamma-percent",
       latex: "γ(%) = 100 * (推力/重力 - 1/(L/D))",
       explainZh: ["以百分比形式表示的爬升/下降梯度"]
     },
     {
       id: "rc",
       latex: "RC = TAS * γ_{rad} ≈ TAS * (推力 - 阻力) / 重力",
       explainZh: ["RC：爬升率（垂直速度），与TAS及(推力-阻力)/重力成正比"]
     },
     {
       id: "rd",
       latex: "RD = - TAS * 阻力 / 重力 = - TAS / (L/D)",
       explainZh: ["RD：下降率，在给定TAS下，L/D越大，下降率（绝对值）越小"]
     }
   ],
   figures: []
 },
 {
   id: "brake-energy-vmbe",
   primaryType: "formula",
   titleZh: "刹车能量与 VMBE",
   summaryZh:
     "中断起飞时，刹车系统必须吸收飞机的动能。该动能与起飞重量和决断速度的平方成正比，其对应的限制速度被定义为最大刹车能量速度VMBE。",
   keywordsZh: ["VMBE", "刹车能量", "中断起飞"],
   keywordsEn: ["VMBE", "brake energy"],
   tags: ["起飞", "限制"],
   contentZh:
     "刹车能量：\n动能与重量成正比，与速度的平方成正比。\nVMBE：最大刹车能量速度，取决于起飞重量和决断速度的平方。",
   formulas: [
     {
       id: "brake-energy",
       latex: "E_{动能} ∝ 重量 * V1^2",
       explainZh: ["E动能：中断起飞时需耗散的动能，与起飞重量和V1的平方成正比"]
     }
   ],
   figures: []
 },
 {
   id: "balanced-field-length",
   primaryType: "formula",
   titleZh: "平衡场长概念",
   summaryZh:
     "平衡场长是指在某一特定决断速度V1下，加速停止距离(ASD)与起飞距离(TOD)相等的跑道长度，这是确定受跑道限制的起飞重量的重要概念。",
   keywordsZh: ["平衡场长", "加速停止", "起飞距离"],
   keywordsEn: ["balanced field", "accelerate-stop", "accelerate-go"],
   tags: ["起飞", "限制"],
   contentZh:
     "平衡场长：\n平衡场长：在特定决断速度 V1 下，加速停止距离 (ASD) 与起飞距离 (TOD) 相等的跑道长度。\n平衡 V1：对应的决断速度 V1。",
   formulas: [
     {
       id: "bfl",
       latex: "ASD(V1) = TOD_{N-1}(V1)",
       explainZh: ["在平衡场长条件下，加速停止距离与一台发动机不工作时的起飞距离相等"]
     }
   ],
   figures: []
 },
 {
   id: "specific-range-and-max-range",
   primaryType: "formula",
   titleZh: "燃油里程与最大航程马赫数",
   summaryZh:
     "燃油里程(SR)定义为单位油耗飞过的距离。最大航程马赫数(MMR)对应燃油里程曲线的峰值，是实现最低燃油消耗和最远航程的基础。",
   keywordsZh: ["燃油里程", "SR", "最大航程马赫数", "MMR"],
   keywordsEn: ["specific range", "maximum range", "MMR"],
   tags: ["巡航", "燃油"],
   contentZh:
     "燃油里程：\nSR：燃油里程 (地面)，单位通常为 NM/kg 或 NM/ton。\n最大航程马赫数：MMR，对应燃油里程曲线的峰值。",
   formulas: [
     {
       id: "specific-range",
       latex: "SR = 地速(GS) / 小时油耗(FF)",
       explainZh: ["SR：燃油里程 (地面)，单位通常为 NM/kg 或 NM/ton"]
     }
   ],
   figures: []
 },
 {
   id: "cruise-minimum-cost",
   primaryType: "formula",
   titleZh: "最低成本巡航与成本指数",
   summaryZh:
     "最低成本巡航通过成本指数(CI)把时间成本和燃油成本折算到同一尺度，在满足运行限制的前提下选择总成本最低的巡航速度。CI 越大，越偏向节省时间；CI 越小，越偏向节省燃油。",
   keywordsZh: ["成本指数", "经济巡航", "ECON 速度", "最小成本"],
   keywordsEn: ["cost index", "ECON speed", "minimum cost cruise"],
   tags: ["巡航", "燃油", "经济运行"],
   contentZh:
     "成本指数：\nCI：成本指数，描述时间成本相对于燃油成本的重要性。\nECON 速度：基于 CI 选择的经济巡航速度。\n最小成本：总成本最低的巡航速度。",
   formulas: [
     {
       id: "ci-definition",
       latex: "CI = \\frac{C_{time}}{C_{fuel}}",
       explainZh: [
         "Ctime：单位时间成本(货币/小时)",
         "Cfuel：单位燃油成本(货币/质量)",
         "CI 描述时间成本相对于燃油成本的重要性，CI 越大，时间成本越占主导"
       ]
     },
     {
       id: "total-cost-per-nm",
       latex: "C_{NM} = \\frac{C_{fuel} * 燃油流量 + C_{time}}{GS}",
       explainZh: [
         "CNM：单位距离的综合成本(货币/NM)",
         "GS：地速，燃油流量和时间成本一起决定每飞行一海里的总成本"
       ]
     },
     {
       id: "econ-speed-trend",
       latex: "CI \\uparrow \\Rightarrow M_{ECON} \\uparrow ,\\quad CI \\downarrow \\Rightarrow M_{ECON} \\downarrow",
       explainZh: [
         "成本指数越高，经济巡航速度越大，更接近允许的最高巡航马赫数",
         "成本指数越低，经济巡航速度越小，更接近最大航程马赫数或绿点速度对应的速度"
       ]
     }
   ],
   figures: []
 },
 {
   id: "fuel-basic-scheme",
   primaryType: "formula",
   titleZh: "燃油计划基本构成与储备油",
   summaryZh:
     "飞行计划中的起飞油量由航程油和各类储备油组成，主要包括：应急油、备降油、最终储备油以及可能需要的额外油。",
   keywordsZh: ["航程油", "储备油", "应急油", "备降油", "最终储备油"],
   keywordsEn: ["trip fuel", "reserve fuel", "final reserve", "contingency fuel"],
   tags: ["燃油", "规划"],
   contentZh:
     "燃油组成：\n起飞油量：等于滑行油加上航程油和各项储备油。\n应急油 CF：用于应对非预期情况，按规定比例或时间计算。\n备降油 AF：从目的地复飞至备降场所需的油量。\n最终储备油 FR：在备降场（或目的地）着陆后的最低剩油。\n额外油 Add：为满足特殊运行条件（如 EDTO、孤立机场）而携带的额外油量。",
   formulas: [
     {
       id: "takeoff-fuel",
       latex: "起飞油量 = 滑行油 + 航程油 + 应急油 + 备降油 + 最终储备油 + ...",
       explainZh: ["标准的燃油政策构成，还可能包括额外的油(Add)和超出的油(XF/DF)"]
     },
     {
       id: "reserve-fuel",
       latex:
         "总储备油 = 应急油 + 备降油 + 最终储备油 + 额外油",
       explainZh: [
         "应急油(CF)：应对非预期情况，如风或航路变化",
         "备降油(AF)：从目的地复飞至备降场所需油量",
         "最终储备油(FR)：在备降场（或目的地）着陆后的最低油量",
         "额外油(Add)：满足特殊运行条件所需油量"
       ]
     },
     {
       id: "final-reserve-easa",
       latex: "最终储备油(EASA) = 在备降场上空1500英尺以等待速度飞行30分钟所需油量",
       explainZh: [
         "EASA (原JAR-OPS)对最终储备油的规定"
       ]
     },
     {
       id: "final-reserve-faa",
       latex: "最终储备油(FAA-Domestic) = 按正常巡航油耗飞行45分钟所需油量",
       explainZh: ["FAA对美国国内航班最终储备油的规定"]
     },
     {
       id: "contingency-basic",
       latex: "应急油(EASA) = max( 5%的航程油 , 在目的地1500英尺等待5分钟所需油量 )",
       explainZh: [
         "EASA基础方案下应急油的计算方法"
       ]
     },
     {
       id: "contingency-era",
       latex:
         "当具有航线备降场时，经批准可将应急油减至3%的航程油。",
       explainZh: [
         "在特定条件下 (EASA Basic Scheme with variations)，应急油可以按规定减少"
       ]
     },
     {
       id: "fuel-remaining",
       latex: "着陆机场的最小油量 >= 最终储备油",
       explainZh: [
         "法规要求飞机在任何着陆机场着陆时，机上剩油都不能低于最终储备油"
       ]
     }
   ],
   figures: []
 },
 {
   id: "EDTO-fuel-and-constraints",
   primaryType: "formula",
   titleZh: "EDTO/ETOPS运行的时间与燃油约束",
   summaryZh:
     "EDTO/ETOPS运行需要同时满足时间和燃油约束：起飞备降场需在规定时间内可达；航路上任一点到最近备降场的改航时间不得超过批准的EDTO时间；在最关键点，还需为发动机失效或增压故障等关键情况规划足够的额外油量。",
   keywordsZh: ["EDTO", "ETOPS", "改航时间", "额外油量", "最关键点"],
   keywordsEn: ["EDTO", "ETOPS", "diversion time", "additional fuel", "critical point"],
   tags: ["巡航", "限制", "燃油"],
   contentZh:
     "EDTO 运行约束：\n时间约束：对于双发飞机，非 EDTO 运行时，起飞备降场需在单发巡航 60 分钟内可达；获得 EDTO 批准后，航路上任意一点到最近合适备降场的单发或增压故障改航时间不得超过批准的 EDTO 时间。\n燃油约束：在最关键点（critical point）必须规划足够的额外油量，以保证在发生发动机失效或增压故障等关键情况后，能安全飞抵备降场、等待 15 分钟并完成进近和着陆。",
   formulas: [
     {
       id: "takeoff-altn-time-twin",
       latex: "双发飞机至起飞备降场时间(非EDTO) <= 60分钟 @ 单发巡航速度",
       explainZh: [
         "标准规定：双发飞机起飞备降场需在单发巡航60分钟（静风）内可达"
       ]
     },
     {
       id: "takeoff-altn-time-twin-EDTO",
       latex: "双发飞机至起飞备降场时间(EDTO) <= EDTO批准时间",
       explainZh: [
         "获得EDTO运行批准后，此时间限制可放宽"
       ]
     },
     {
       id: "takeoff-altn-time-four",
       latex: "四发飞机至目的地航程 > 90分钟，需考虑双发失效",
       explainZh: [
         "若四发飞机航路某点距离备降场超过所有发动机工作时的90分钟航程，需为双发失效做额外规划"
       ]
     },
     {
       id: "route-diversion-time",
       latex: "任一点的改航时间 <= 批准的EDTO时间",
       explainZh: [
         "航路上任一点到最近合适备降场的改航时间不得超过批准的EDTO时间"
       ]
     },
     {
       id: "EDTO-additional-fuel-basic",
       latex:
         "额外油(EDTO) >= 油量(关键点->备降场) + 15分钟等待油 + 进近着陆油",
       explainZh: [
         "在最关键点，必须保证在发动机失效或增压故障的关键情况下，有足够燃油完成改航、等待和着陆"
       ]
     }
   ],
   figures: []
 },
 {
   id: "takeoff-trajectory",
   primaryType: "formula",
   titleZh: "起飞航迹与单发爬升梯度",
   summaryZh:
     "起飞航迹可按发动机失效后一系列爬升和加速段来描述。法规对各段的净爬升梯度提出最低要求，并通过总飞行航迹减去固定裕度得到净飞行航迹，以保证在跑道终端以外的整个航迹上满足障碍净空。",
   keywordsZh: ["起飞航迹", "单发爬升", "爬升梯度", "净飞行航迹"],
   keywordsEn: ["takeoff trajectory", "OEI", "climb gradient", "net flight path"],
   tags: ["起飞", "爬升", "障碍净空"],
   contentZh:
     "起飞航迹：\n单发起飞情景下，航迹分为若干典型段：离地后保持起飞构型和 V2 附近速度的第二段爬升、加速/收襟翼段以及清洁构型下的最终爬升段。\n净飞行航迹：总飞行航迹减去固定梯度裕度得到，用于考虑飞行偏差和性能不确定性，保证起飞路径在跑道终端以外对障碍物保持规定净空。",
   formulas: [
     {
       id: "takeoff-climb-gradient-def",
       latex: "梯度 = \\frac{\\Delta h}{\\Delta s} \\approx \\tan \\gamma",
       explainZh: [
         "起飞爬升梯度通常以高度变化与水平距离之比来表示"
       ]
     },
     {
       id: "takeoff-net-flight-path",
       latex: "\\gamma_{net} = \\gamma_{gross} - \\text{法规修正}",
       explainZh: [
         "净飞行航迹梯度由总飞行航迹梯度减去法规规定的固定裕度得到 (双发 0.8%, 四发 1.0%)"
       ]
     },
     {
       id: "takeoff-segment-2-gradient",
       latex: "\\gamma_{net,2段} \\ge 2.4\\% \\ (双发飞机)",
       explainZh: [
         "对双发飞机而言，第二段单发起飞爬升的最小净爬升梯度为 2.4%，三发(2.7%)和四发(3.0%)飞机的要求更高"
       ]
     },
     {
       id: "takeoff-obstacle-clearance",
       latex: "h_{net}(x) \\ge h_{obs}(x) + 35\\ \\text{ft}",
       explainZh: [
         "在跑道终端以外，通过障碍物时净飞行航迹高度必须至少高出障碍物 35 ft，用于保证起飞阶段的障碍净空"
       ]
     }
   ],
   figures: []
 },
 {
   id: "enroute-obstacle-clearance-oei",
   primaryType: "formula",
   titleZh: "一台发动机不工作时在航线上的越障",
   summaryZh:
     "在一台发动机失效的巡航或飘降情景下，法规要求飞机的净飞行航迹在航路走廊内始终高于所有地形和障碍物一定裕度。运营方通过飘降程序或性能软件验证，从任意点开始按单发程序飞行时，净飞行航迹可以满足 1000/2000 ft 的垂直间隔。",
   keywordsZh: ["单发", "巡航", "飘降", "障碍净空", "净飞行航迹"],
   keywordsEn: ["OEI", "en route", "driftdown", "obstacle clearance", "net path"],
   tags: ["巡航", "限制", "障碍净空"],
   contentZh:
     "一台发动机不工作时的越障：\n单发巡航或飘降：飞机的净飞行航迹必须始终高于所有地形和障碍物一定裕度。\n飘降程序或性能软件验证：从任意点开始按单发程序飞行时，净飞行航迹可以满足 1000/2000 ft 的垂直间隔。",
   formulas: [
     {
       id: "enroute-oei-gradient",
       latex: "梯度_{OEI} = \\frac{T - D}{W}",
       explainZh: [
         "T：剩余发动机推力",
         "D：阻力",
         "W：飞机重量",
         "单发爬升或飘降梯度取决于剩余推力与阻力之差和飞机重量"
       ]
     },
     {
       id: "enroute-net-gradient",
       latex: "\\gamma_{net,OEI} = \\gamma_{gross,OEI} - \\text{法规修正}",
       explainZh: [
         "净飞行航迹梯度由单发总飞行航迹梯度减去法规规定的固定裕度 (双发 1.1%, 四发 1.6%)"
       ]
     },
     {
       id: "enroute-obstacle-margin-low",
       latex: "h_{net}(x) \\ge h_{obs}(x) + 1000\\ \\text{ft}",
       explainZh: [
         "条件1：净飞行航迹必须能在高于障碍物 1000 ft 的高度上保持正梯度"
       ]
     },
     {
       id: "enroute-obstacle-margin-mountainous",
       latex: "h_{net}(x) \\ge h_{obs}(x) + 2000\\ \\text{ft}",
       explainZh: [
         "条件2 (飘降时)：净飞行航迹必须全程高于障碍物至少 2000 ft"
       ]
     }
   ],
   figures: []
 },
 {
   id: "redispatch-rcf-fuel",
   primaryType: "formula",
   titleZh: "决策点程序(RCF)燃油条件",
   summaryZh:
     "决策点程序(或二次放行)通过在航路上设置一个决策点B，允许在起飞时携带少于标准情况的应急油。程序要求在决策点B，机组必须确认剩余油量足以安全飞抵目的地或改航至备降场。",
   keywordsZh: ["决策点程序", "二次放行", "RCF", "燃油计划"],
   keywordsEn: ["redispatch", "RCF", "decision point", "critical point"],
   tags: ["燃油", "规划", "长航程"],
   contentZh:
     "决策点程序燃油条件：\n决策点原则：起飞所需燃油是“飞往目的地”和“飞往航线备降场”两种方案所需油量中的较大者。\n方案一（飞往目的地）：油量需满足从决策点 B 飞往目的地 C，并满足该航段的应急油、备降油和最终储备油。\n方案二（飞往航线备降场）：油量需满足从起飞机场 A 飞往航线备降场 E，并满足该航段的应急油和最终储备油。",
   formulas: [
     {
       id: "rcf-fuel-to-dest",
       latex:
         "F1 = 油量(滑行A + 航程AC) + 应急油(BC段) + 备降油(CD) + 最终储备(D) + ...",
       explainZh: [
         "方案一：继续飞往目的地C。应急油仅按BC段航程油计算。"
       ]
     },
     {
       id: "rcf-fuel-to-alt",
       latex:
         "F2 = 油量(滑行A + 航程AE) + 应急油(AE段) + 最终储备(E) + ...",
       explainZh: [
         "方案二：从A飞往航线备降场E。"
       ]
     },
     {
       id: "rcf-decision-condition",
       latex:
         "起飞油量 >= max( F1 , F2 )",
       explainZh: [
         "决策点程序的核心：起飞时携带的燃油必须满足两种方案中要求较高的一个，从而在决策点获得灵活性"
       ]
     }
   ],
   figures: []
 },

 // =====================================
 // (新增聚合卡片) 飞行限制 (速度与最小控制)
 // =====================================
 {
   id: "flight-limitations-vmu-vmcl-vmo",
   primaryType: "formula",
   titleZh: "飞行限制 (VMO/VFE/VMU/VMCL)",
   summaryZh:
     "飞机运行受限于一系列最大速度和最小控制速度，以确保结构完整性和操纵安全。这包括最大操作速度(VMO/MMO, VFE, VLO/VLE)，以及最小控制速度如 VMU (最小离地) 和 VMCL (着陆)。",
   keywordsZh: ["VMO", "MMO", "VFE", "VLO", "VLE", "VMCL", "VMU", "最小控制速度", "最小离地速度", "最大速度"],
   keywordsEn: ["VMO", "VFE", "VLE", "VMCL", "VMU", "max speed", "min control speed"],
   tags: ["限制", "速度", "起飞", "着陆"],
   contentZh:
     "最大速度：\nVMO/MMO：任何飞行阶段都不得有意超过的速度。\nVFE：不同襟翼形态下的最大允许速度。\nVLO/VLE：最大起落架操作/放出速度。\n最小控制速度：\nVMU (最小离地速度)：飞机可以安全离地的最小速度，分为 VMU(N) (全发) 和 VMU(N-1) (单发)。\nVMCL (最小控制速度-着陆)：进近和着陆形态下，单发失效时仍能保持控制的最小速度。",
   formulas: [
     {
       id: "vmo-mmo-new",
       latex: "V_{MO} / M_{MO}",
       explainZh: ["最大操作速度/马赫数"]
     },
     {
       id: "vfe-new",
       latex: "V_{FE}",
       explainZh: ["最大襟翼放出速度 (不同形态有不同值)"]
     },
     {
       id: "vlo-vle-new",
       latex: "V_{LO} / V_{LE}",
       explainZh: ["最大起F落架操作速度 / 放出速度"]
     },
     {
       id: "vmu-new",
       latex: "V_{MU}",
       explainZh: ["最小离地速度 (分为 Vmu(N) 和 Vmu(N-1))"]
     },
     {
       id: "vmcl-new",
       latex: "V_{MCL}",
       explainZh: ["着陆形态的最小控制速度"]
     }
   ],
   figures: []
 },
 // =====================================
 // (新增聚合卡片) 发动机推力管理
 // =====================================
 {
   id: "engine-thrust-management-ratings-flex",
   primaryType: "formula",
   titleZh: "发动机推力管理 (额定值与减推力)",
   summaryZh:
     "发动机推力管理包括了解基本的推力额定值（TOGA, MCT, CL）以及如何使用减推力起飞（FLEX 或 Derated）来优化发动机寿命和运营成本。",
   keywordsZh: ["TOGA", "MCT", "CL", "推力", "灵活起飞", "FLEX", "降低额定功率", "Derated", "减推力"],
   keywordsEn: ["TOGA", "MCT", "CL", "Thrust Rating", "Flexible Takeoff", "FLEX", "Derated Takeoff"],
   tags: ["发动机", "限制", "起飞", "经济运行"],
   contentZh:
     "推力额定值：\nTOGA (起飞/复飞)：最大推力，有时间限制 (AEO 5分钟, OEI 10分钟)。\nMCT (最大连续推力)：空中无时间限制的最大推力，用于单发巡航。\nCL (爬升推力)：爬升阶段使用的最大推力。\n减推力起飞：\nFLEX (灵活起飞)：使用“假设温度” (T_Flex) 计算推力，推力减小不得超过 40%，且不能用于污染跑道。\nDerated (降低额定功率)：选择一个固定的、审定的较低推力等级，VMCG/VMCA 会相应降低，可用于污染跑道。",
   formulas: [
     {
       id: "flex-temp-new",
       latex: "T_{Flex} \\ge OAT \\text{ 且 } T_{Flex} \\le T_{MAX\_FLEX}",
       explainZh: ["灵活温度必须高于实际气温，但低于最大灵活温度限制"]
     },
     {
       id: "flex-thrust-limit-new",
       latex: "Thrust_{FLEX} \\ge 60\\% * Thrust_{TOGA}",
       explainZh: ["灵活起飞的推力减小量不得超过最大起飞推力的 40%"]
     }
   ],
   figures: []
 },

 // =====================================
 // (新增聚合卡片) 起飞距离计算
 // =====================================
 {
   id: "takeoff-distance-calculations-tora-tor-asd",
   primaryType: "formula",
   titleZh: "起飞距离计算 (TORA, TOR, ASD)",
   summaryZh:
     "起飞性能计算的核心是确保飞机计算出的起飞滑跑距离 (TOR) 和加速停止距离 (ASD) 都不超过机场当局公布的可用距离 (TORA 和 ASDA)。",
   keywordsZh: ["TORA", "TODA", "ASDA", "TOR", "ASD", "起飞距离", "起飞滑跑距离", "加速停止距离"],
   keywordsEn: ["TORA", "TODA", "ASDA", "TOR", "ASD", "Takeoff Distance", "Takeoff Run", "Accelerate-Stop Distance"],
   tags: ["起飞", "限制", "基础概念"],
   contentZh:
     "可用距离：\nTORA (可用起飞滑跑距离)：可用于地面滑跑的跑道长度。\nASDA (可用加速停止距离)：TORA 加上停止道 (SWY)。\nTODA (可用起飞距离)：TORA 加上净空道 (CWY)。\n计算距离 (必须满足)：\nTOR (起飞滑跑距离)：飞机在地面滑跑的距离。必须 TOR <= TORA。\nASD (加速停止距离)：在 V1 中断起飞并完全停止所需的距离。必须 ASD <= ASDA。\nTOD (起飞距离)：达到 35 英尺（湿跑道 15 英尺）所需的总距离。必须 TOD <= TODA。",
   formulas: [
     {
       id: "tora-new",
       latex: "TORA",
       explainZh: ["可用起飞滑跑距离 (跑道本身的长度)"]
     },
     {
       id: "asda-new",
       latex: "ASDA = TORA + 停止道 (SWY)",
       explainZh: ["可用加速停止距离"]
     },
     {
       id: "toda-new",
       latex: "TODA = TORA + 净空道 (CWY)",
       explainZh: ["可用起飞距离"]
     },
     {
       id: "tor-tora-new",
       latex: "TOR \\le TORA",
       explainZh: ["计算的起飞滑跑距离必须小于可用的"]
     },
     {
       id: "asd-asda-new",
       latex: "ASD \\le ASDA",
       explainZh: ["计算的加速停止距离必须小于可用的"]
     }
   ],
   figures: []
 },

 // =====================================
 // (新增聚合卡片) 爬升、巡航与下降策略
 // =====================================
 {
   id: "cruise-climb-descent-strategy",
   primaryType: "definition",
   titleZh: "爬升、巡航与下降策略",
   summaryZh:
     "飞行管理涉及在爬升、巡航和下降阶段选择最优的速度和高度策略，以平衡燃油、时间和成本。关键概念包括 ECON 速度、LRC、最佳高度 (OPT) 和最大推荐高度 (REC MAX)。",
   keywordsZh: ["爬升速度", "巡航速度", "下降", "等待", "ECON", "LRC", "最佳高度", "REC MAX", "抖振升限"],
   keywordsEn: ["Climb", "Cruise", "Descent", "Holding", "ECON", "LRC", "Optimum Altitude", "REC MAX", "Buffet Ceiling"],
   tags: ["爬升", "巡航", "下降", "经济运行", "速度", "高度"],
   contentZh:
     "爬升：\nECON 爬升：基于成本指数 (CI) 的速度，平衡时间与燃油。\n最大梯度爬升：绿点速度 (GDS)，用于最短距离爬升。\n最大爬升率爬升：最短时间爬升 (CI=0)。\n巡航：\nLRC (远程巡航)：99% 的最大燃油里程 (SR)，速度比 MMR 快。\nOPT (最佳高度)：SR 最大的高度。\nREC MAX (最大推荐高度)：受 1.3g 抖振、发动机推力（爬升/巡航升限）和审定高度限制的最低值。\n下降与等待：\n下降：通常在飞行慢车推力下，以 ECON 速度或 M/IAS 剖面进行。\n等待：通常在绿点速度 (GDS) 下执行，以获得最大续航时间。",
   formulas: [],
   figures: []
 },

 // =====================================
 // (新增聚合卡片) 着陆性能与复飞
 // =====================================
 {
   id: "landing-go-around-performance-lda-rld-ldta",
   primaryType: "formula",
   titleZh: "着陆性能与复飞",
   summaryZh:
     "着陆性能涉及可用距离 (LDA) 和飞机所需的着陆距离。所需距离分为放行前计算的 RLD 和空中计算的 LDTA (FLD)。同时，必须满足复飞时的最低爬升梯度要求。",
   keywordsZh: ["LDA", "ALD", "RLD", "LDTA", "FLD", "着陆距离", "复飞", "进近爬升", "着陆爬升", "OEI"],
   keywordsEn: ["LDA", "ALD", "RLD", "LDTA", "FLD", "Landing Distance", "Go-Around", "Approach Climb", "Landing Climb", "OEI"],
   tags: ["着陆", "复飞", "限制", "规划", "运行"],
   contentZh:
     "可用距离：LDA (可用着陆距离) 是跑道可用于着陆的长度。\n审定距离（基础）：ALD (实际着陆距离) 是从 50 英尺高度点到完全停止的距离。\n放行距离（规划）：RLD (所需着陆距离) = ALD / 0.6 (干跑道)，放行时必须满足 RLD <= LDA。\n空中距离（运行）：LDTA (到场着陆距离) 是基于实际条件计算的，法规要求 FLD (LDTA * 1.15) <= LDA。\n复飞梯度：飞机必须满足“进近爬升”（单发，起落架收上，2.1%）和“着陆爬升”（全发，起落架放下，3.2%）的最低梯度要求。",
   formulas: [
     {
       id: "rld-dry-new",
       latex: "RLD_{干} = ALD_{干} / 0.6",
       explainZh: ["放行所需着陆距离 (干跑道)"]
     },
     {
       id: "rld-wet-new",
       latex: "RLD_{湿} = RLD_{干} * 1.15",
       explainZh: ["放行所需着陆距离 (湿跑道)"]
     },
     {
       id: "fld-easa-new",
       latex: "FLD = LDTA * 1.15",
       explainZh: ["EASA 要求的空中计算着陆距离 (带15%余度)"]
     },
     {
       id: "fld-vs-lda-new",
       latex: "FLD \\le LDA",
       explainZh: ["空中必须确认 FLD 不超过 LDA"]
     },
     {
       id: "approach-climb-new",
       latex: "\\gamma_{Approach Climb} (OEI, Gear Up) \\ge 2.1\\%",
       explainZh: ["进近爬升梯度 (双发，单发，起落架收上)"]
     },
     {
       id: "landing-climb-new",
       latex: "\\gamma_{Landing Climb} (AEO, Gear Down) \\ge 3.2\\%",
       explainZh: ["着陆爬升梯度 (全发，起落架放下)"]
     }
   ],
   figures: []
 },

 // =====================================
 // (新增聚合卡片) 增压故障
 // =====================================
 {
   id: "pressurization-failure-descent-new",
   primaryType: "definition",
   titleZh: "增压故障下降",
   summaryZh:
     "如果发生空中客舱增压故障（释压），飞机必须立即下降到安全高度（通常为 FL100 或最低安全高度 MSA），以确保机组和旅客有足够的氧气。",
   keywordsZh: ["释压", "增压故障", "紧急下降", "氧气"],
   keywordsEn: ["Depressurization", "Pressurization Failure", "Emergency Descent", "Oxygen"],
   tags: ["应急", "下降", "限制"],
   contentZh:
     "增压故障紧急下降：\n氧气供应时间：旅客氧气系统的供应时间有限，例如化学氧气系统通常约为 15 或 22 分钟。\n下降动作：必须立即执行紧急下降程序，推力慢车，将速度增加到 MMO/VMO，并视需要使用减速板 (Speed Brakes) 增大下降率。\n目标高度：尽快下降至 FL100 或最低安全高度 (MSA)，以确保机组和旅客有足够的氧气。",
   formulas: [],
   figures: []
 }
];

module.exports = aircraftPerformanceFormulaCards;
