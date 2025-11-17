// 飞机性能“公式卡片”数据
// 用于小程序重构：优先将相互有关系的公式聚合成一张卡片

const aircraftPerformanceFormulaCards = [
  // =====================================
  // A. AIRCRAFT LIMITATIONS – WEIGHTS
  // =====================================
  {
    id: "weights-tow-lw-zfw",
    primaryType: "formula",
    titleZh: "起飞重量、着陆重量与无燃油重量关系",
    titleEn: "Relationships between TOW, LW and ZFW",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "2. MAXIMUM STRUCTURAL WEIGHTS / DEFINITIONS",
    summaryZh:
      "干重 DOW、载荷、预备油和航程油的组合形成起飞重量 TOW、着陆重量 LW 和无燃油重量 ZFW，同时还需满足最大结构着陆重量 MLW 的限制。",
    keywordsZh: ["TOW", "LW", "ZFW", "MLW", "重量关系"],
    keywordsEn: ["TOW", "LW", "ZFW", "MLW", "weights"],
    tags: ["基础概念", "重量"],
    contentZh:
      "TOW 由干重、载荷和全部燃油构成；着陆重量 LW 等于起飞重量减去航程油；无燃油重量 ZFW 仅包含机体和载荷，不含任何燃油。实际运行时，还必须保证实际着陆重量不超过最大结构着陆重量 MLW，从而推导出起飞重量的上限。",
    contentEn:
      "The documentation defines simple equations linking dry operating weight, traffic load, fuel reserves, trip fuel, takeoff weight, landing weight and zero fuel weight, together with limitations driven by MLW.",
    formulas: [
      {
        id: "tow-equation",
        latex: "TOW = DOW + traffic load + fuel reserves + trip fuel",
        explainZh: [
          "TOW：起飞重量",
          "DOW：干重（机组、餐食等固定项目）",
          "traffic load：旅客和货物",
          "fuel reserves：各类预备油",
          "trip fuel：航程油"
        ]
      },
      {
        id: "lw-equation",
        latex: "LW = DOW + traffic load + fuel reserves",
        explainZh: ["LW：着陆重量，等于 ZFW 加上预备油"]
      },
      {
        id: "zfw-equation",
        latex: "ZFW = DOW + traffic load",
        explainZh: ["ZFW：无燃油重量，仅包含机体和载荷，不含任何燃油"]
      },
      {
        id: "actual-lw-mlw",
        latex: "Actual LW = TOW - Trip fuel <= MLW",
        explainZh: [
          "Actual LW：预计实际着陆重量",
          "必须不超过最大结构着陆重量 MLW"
        ]
      },
      {
        id: "actual-tow-mlw",
        latex: "Actual TOW <= MLW + Trip fuel",
        explainZh: [
          "与上一式等价的写法",
          "起飞重量上限等于 MLW 加上预计航程油量"
        ]
      }
    ],
    figures: []
  },

  // =====================================
  // C. TAKEOFF – TOD ON DRY/WET RUNWAYS
  // =====================================
  {
    id: "tod-dry-wet",
    primaryType: "formula",
    titleZh: "干跑道/湿跑道起飞距离 TOD_dry / TOD_wet",
    titleEn: "Takeoff Distance on Dry and Wet Runways",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh:
      "干跑道起飞距离 TOD_dry 取单发和全发两种距离中的较大值（全发距离乘以 1.15 的安全系数）；湿跑道起飞距离 TOD_wet 再在 TOD_dry 与单发湿跑道距离之间取最大值，最终 TOD 不得超过 TODA。",
    keywordsZh: ["起飞距离", "TOD_dry", "TOD_wet", "TODA"],
    keywordsEn: ["takeoff distance", "TOD_dry", "TOD_wet", "TODA"],
    tags: ["起飞", "限制"],
    contentZh:
      "在干跑道时，全发起飞距离 TOD_N,dry 需乘以 1.15 的法规系数，并与单发起飞距离 TOD_N-1,dry 取最大值，得到 TOD_dry。湿跑道时，再在 TOD_dry 与单发湿跑道距离 TOD_N-1,wet 之间取最大值，得到 TOD_wet。无论干跑道还是湿跑道，选定起飞构型和重量后得到的 TOD 必须小于或等于可用起飞距离 TODA。",
    contentEn:
      "On dry runways, TOD_dry is the maximum of the OEI distance and 1.15 times the all-engines-operating distance. On wet runways, TOD_wet is the maximum of TOD_dry and the OEI distance on wet. In all cases, TOD must not exceed TODA.",
    formulas: [
      {
        id: "tod-dry",
        latex: "TOD_dry = max{ TOD_N-1,dry , 1.15 * TOD_N,dry }",
        explainZh: [
          "TOD_N-1,dry：单发干跑道起飞距离",
          "TOD_N,dry：全发干跑道起飞距离",
          "1.15：法规要求的安全系数（115% 距离）"
        ]
      },
      {
        id: "tod-wet",
        latex: "TOD_wet = max{ TOD_dry , TOD_N-1,wet }",
        explainZh: [
          "TOD_N-1,wet：单发湿跑道起飞距离",
          "TOD_wet：湿跑道起飞距离，至少不小于 TOD_dry"
        ]
      },
      {
        id: "tod-toda",
        latex: "TOD <= TODA",
        explainZh: [
          "TOD：选定工况下的起飞距离（干或湿）",
          "TODA：可用起飞距离（TORA 加清除道，清除道长度最多为 TORA 的一半）"
        ]
      }
    ],
    figures: []
  },

  // =====================================
  // B. OPERATING SPEEDS – STALL SPEEDS
  // =====================================
  {
    id: "stall-speed-relationships",
    primaryType: "formula",
    titleZh: "失速速度 VS / VSR / VS1g 关系",
    titleEn: "Stall Speed Relationships: VS, VSR and VS1g",
    chapter: "B. OPERATING SPEEDS",
    section: "1. COMMON SPEEDS",
    summaryZh:
      "失速章节区分了 VS、VSR 和 VS1g：VS1g 对应最大升力系数且载荷因数为 1，VSR 为认证用的参考失速速度，VS 为传统气动失速速度，并在此基础上定义 V2min 和 VLS 的倍数关系。",
    keywordsZh: ["失速速度", "VS", "VSR", "VS1g"],
    keywordsEn: ["stall speed", "VS", "VSR", "VS1g"],
    tags: ["基础概念", "限制"],
    contentZh:
      "VSR 通过最大升力系数速度 VCLMAX 和载荷因数 n_zw 定义，是认证使用的参考失速速度。多数 Airbus 机型以 1g 失速速度 VS1g 作为 VSR；A320 试飞显示 VS 与 VS1g 存在固定比例关系。基于这些速度，法规给出了 V2min 和 VLS 的下限倍数。",
    contentEn:
      "The brochure distinguishes VS, VSR and VS1g and defines regulatory relationships between them and other speeds such as V2min and VLS.",
    formulas: [
      {
        id: "vsr-def",
        latex: "VSR >= VCLMAX / sqrt(nzw)",
        explainZh: [
          "VSR：参考失速速度",
          "VCLMAX：对应最大升力系数的速度（即 VS1g）",
          "nzw：在 VCLMAX 处的法向载荷因数"
        ]
      },
      {
        id: "vsr-vs1g",
        latex: "VSR = VS1g",
        explainZh: ["多数 Airbus 机型中，参考失速速度 VSR 与 1g 失速速度 VS1g 视为相同"]
      },
      {
        id: "vs-vs1g",
        latex: "VS = 0.94 * VS1g",
        explainZh: ["以 A320 为例，传统失速速度 VS 略低于 1g 失速速度 VS1g"]
      },
      {
        id: "v2min-vsr",
        latex: "V2min >= 1.13 * VSR",
        explainZh: ["涡喷/涡扇飞机的最小起飞安全速度 V2min 至少为 1.13 倍 VSR"]
      },
      {
        id: "v2-vs1g",
        latex: "V2 >= 1.13 * VS1g",
        explainZh: ["对按 VS1g 认证的 Airbus 机型，起飞安全速度 V2 以 1.13 倍 VS1g 为下限"]
      },
      {
        id: "v2-vs-a300",
        latex: "V2 >= 1.2 * VS (A300/A310)",
        explainZh: ["对按 VS 认证的 A300/A310，V2 不得低于 1.2 倍 VS"]
      }
    ],
    figures: []
  },

  // =====================================
  // B. OPERATING SPEEDS – KEY SPEEDS
  // =====================================
  {
    id: "key-takeoff-speeds",
    primaryType: "formula",
    titleZh: "起飞阶段关键速度之间的关系",
    titleEn: "Key Takeoff Speed Relationships",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh:
      "起飞阶段，VMCG、VEF、V1 和 VMBE 之间存在排序关系；抬轮速度 VR 和起飞安全速度 V2 必须明显高于空中最小操纵速度 VMCA，同时抬离速度 VLOF 受轮胎最大速度 VTIRE 限制。",
    keywordsZh: ["VMCG", "V1", "VMBE", "VR", "V2", "VMCA", "VLOF", "VTIRE"],
    keywordsEn: ["VMCG", "V1", "VMBE", "VR", "V2", "VMCA", "VLOF", "VTIRE"],
    tags: ["起飞", "限制"],
    contentZh:
      "性能与法规要求：地面最小操纵速度 VMCG 必须低于发动机失效速度 VEF，VEF 低于决断速度 V1，V1 又不得超过刹车能量限制速度 VMBE；抬轮速度 VR 和起飞安全速度 V2 均需高于空中最小操纵速度 VMCA，以保证单发情况下的方向控制和失速裕度；同时抬离速度 VLOF 不得超过轮胎速度限制 VTIRE。",
    contentEn:
      "Certification links key takeoff speeds through inequalities to ensure controllability, brake energy margins and tire speed limits.",
    formulas: [
      {
        id: "vmcg-vef-v1-vmbe",
        latex: "VMCG <= VEF < V1 <= VMBE",
        explainZh: ["发动机失效识别和拒绝起飞情景下的速度排序关系"]
      },
      {
        id: "vr-vmca",
        latex: "VR >= 1.05 * VMCA",
        explainZh: ["抬轮速度必须至少为空中最小操纵速度 VMCA 的 1.05 倍"]
      },
      {
        id: "v2-vmca",
        latex: "V2 >= 1.1 * VMCA",
        explainZh: ["起飞安全速度 V2 至少为 VMCA 的 1.1 倍"]
      },
      {
        id: "vlof-vtire",
        latex: "VLOF <= VTIRE",
        explainZh: ["抬离速度对应的地速必须不超过轮胎最大允许速度 VTIRE"]
      }
    ],
    figures: []
  },

  // =====================================
  // B. OPERATING SPEEDS – APPROACH/LANDING
  // =====================================
  {
    id: "approach-landing-speeds",
    primaryType: "formula",
    titleZh: "进近与着陆速度之间的关系",
    titleEn: "Approach and Landing Speed Relationships",
    chapter: "B. OPERATING SPEEDS",
    section: "3. LANDING SPEEDS",
    summaryZh:
      "最低可选速度 VLS 与 VS 或 VS1g 有固定倍数关系；进近速度 VAPP 至少不低于 VLS，并在其基础上加风修正；参考着陆速度 VREF 在正常情况下等于着陆构型下的 VLS，若有系统失效则在 VREF 基础上加速度增量。",
    keywordsZh: ["VLS", "VAPP", "VREF", "GSmini"],
    keywordsEn: ["VLS", "VAPP", "VREF", "GSmini"],
    tags: ["进近", "着陆", "限制"],
    contentZh:
      "在巡航和进近阶段，飞行员不应选择低于 VLS 的速度。对多数 Airbus 机型，VLS 至少为 1.23 倍 VS1g；A300/A310 中 VLS 等于 1.3 倍 VS。进近目标速度 VAPP 至少不小于 VLS，并在其基础上加上限定范围内的风修正。FMGS 还定义了 GSmini 和 VAPP TARGET，用于在多变风条件下保持地速不致过低。",
    contentEn:
      "VLS is defined as a multiple of VS or VS1g. VAPP must be above VLS with an added wind correction. VREF equals VLS in landing configuration in the all-systems-normal case, and GSmini with VAPP TARGET are used for speed management in approach.",
    formulas: [
      {
        id: "vls-vs1g",
        latex: "VLS >= 1.23 * VS1g",
        explainZh: ["多数 Airbus 机型中，VLS 至少为 1.23 倍 1g 失速速度"]
      },
      {
        id: "vls-vs-a300",
        latex: "VLS = 1.3 * VS (A300/A310)",
        explainZh: ["A300/A310 中，VLS 以 VS 为基准"]
      },
      {
        id: "vapp-min",
        latex: "VAPP >= VLS",
        explainZh: ["进近速度不得低于 VLS"]
      },
      {
        id: "vapp-def",
        latex: "VAPP = VLS + Wind correction",
        explainZh: ["Wind correction 通常限制在 5–15 kt 之间"]
      },
      {
        id: "gsmini",
        latex: "GSmini = VAPP - tower wind",
        explainZh: ["GSmini：考虑塔台风后的最小地速目标"]
      },
      {
        id: "vapp-target",
        latex: "VAPP_TARGET = GSmini + current headwind",
        explainZh: ["FMGS 根据当前逆风调整的进近速度目标"]
      },
      {
        id: "vref",
        latex: "VREF = VLS in landing configuration",
        explainZh: ["正常情况下，VREF 等于着陆构型下的 VLS"]
      },
      {
        id: "vapp-inop",
        latex: "VAPP = VREF + Delta V_INOP",
        explainZh: ["有系统失效影响着陆性能时，在 VREF 基础上加上规定的速度增量"]
      }
    ],
    figures: []
  },

  // =====================================
  // A. LOAD FACTORS – BASIC RELATIONS
  // =====================================
  {
    id: "load-factor-and-apparent-weight",
    primaryType: "formula",
    titleZh: "载荷因数与表观重量",
    titleEn: "Load Factor and Apparent Weight",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.1 LOAD FACTORS",
    summaryZh:
      "载荷因数 n_z 定义为升力与飞机重量之比，在机动或乱流中决定结构受力；当 n_z 不等于 1 时，机组感觉到的“表观重量”与实际重量不同。",
    keywordsZh: ["载荷因数", "表观重量", "nz"],
    keywordsEn: ["load factor", "apparent weight", "nz"],
    tags: ["基础概念", "飞行力学"],
    contentZh:
      "在定常平飞时，升力等于重量，对应 n_z = 1；在转弯、拉起或乱流中 n_z 会增大，使结构和机组承受更大的表观重量。本卡用简单公式给出 n_z 和表观重量 W_a 与升力和质量之间的关系，用于理解机动限制和飞行包线。",
    contentEn:
      "This card defines the load factor as the ratio of lift to weight and introduces the concept of apparent weight in manoeuvres and turbulence.",
    formulas: [
      {
        id: "nz-def",
        latex: "nz = Lift / Weight",
        explainZh: ["载荷因数等于升力与重量之比"]
      },
      {
        id: "apparent-weight",
        latex: "Wa = nz * m * g = Lift",
        explainZh: [
          "Wa：表观重量",
          "m：质量，g：重力加速度",
          "当 nz 增大时，机组感觉到的重量随之增大"
        ]
      }
    ],
    figures: []
  },

  // =====================================
  // APPENDIX 5 – LIFT / DRAG / MACH / AoA
  // =====================================
  {
    id: "lift-drag-and-mach",
    primaryType: "formula",
    titleZh: "升力、阻力、马赫数与迎角关系",
    titleEn: "Lift, Drag, Mach Number and Angle of Attack",
    chapter: "APPENDIX 5 – FLIGHT MECHANICS",
    section: "1.1–1.3 FLIGHT MECHANICS",
    summaryZh:
      "标准升力/阻力方程把速度、机翼面积和气动系数与升力、阻力联系起来，可以改写为马赫数形式；在失速前的线性区间内，升力系数随迎角增加而增加，为保持升力=重量，速度必须降低。",
    keywordsZh: ["升力", "阻力", "CL", "CD", "马赫数", "迎角"],
    keywordsEn: ["lift", "drag", "CL", "CD", "Mach", "angle of attack"],
    tags: ["飞行力学", "基础公式"],
    contentZh:
      "在定常平飞中，升力等于重量、推力等于阻力。升力和阻力可写成空气密度、机翼面积、真空速以及对应气动系数的函数；在标准大气假设下，又可以写成静压和马赫数的函数。在迎角未达失速前，升力系数 CL 随迎角近似线性增加，为保持升力 = 重量，真空速 TAS 必须相应降低。",
    contentEn:
      "The standard lift and drag equations can be expressed in terms of TAS or Mach number. Below stall, CL increases with angle of attack and TAS must decrease to keep lift equal to weight.",
    formulas: [
      {
        id: "lift-standard",
        latex: "L = W = 0.5 * rho * S * V^2 * CL",
        explainZh: ["标准升力方程（定常平飞时 L ≈ W）"]
      },
      {
        id: "drag-standard",
        latex: "D = T = 0.5 * rho * S * V^2 * CD",
        explainZh: ["标准阻力方程（定常平飞时 D ≈ 所需推力 T）"]
      },
      {
        id: "lift-mach",
        latex: "W = 0.7 * Ps * S * M^2 * CL",
        explainZh: ["升力写成静压 Ps 与马赫数 M 的形式，系数 0.7 为工程近似"]
      },
      {
        id: "drag-mach",
        latex: "T = 0.7 * Ps * S * M^2 * CD",
        explainZh: ["阻力/所需推力的马赫数形式"]
      },
      {
        id: "cl-alpha",
        latex: "alpha up => CL up (pre-stall)",
        explainZh: ["在失速前的线性区间内，升力系数随迎角增加而增加"]
      },
      {
        id: "cl-tas",
        latex: "W = 0.5 * rho * S * TAS^2 * CL = constant",
        explainZh: ["定常平飞时，W、rho、S 在短时间内近似不变"]
      },
      {
        id: "cl-tas-tradeoff",
        latex: "CL up => TAS down (W,rho,S fixed)",
        explainZh: ["为保持升力=重量，CL 增加时 TAS 必须降低"]
      }
    ],
    figures: []
  },

  // =====================================
  // APPENDIX 5 – CLIMB / DESCENT
  // =====================================
  {
    id: "climb-descent-performance",
    primaryType: "formula",
    titleZh: "爬升/下降梯度与爬升率/下降率",
    titleEn: "Climb and Descent Gradients, RC and RD",
    chapter: "APPENDIX 5 – FLIGHT MECHANICS",
    section: "1.4 CLIMB AND DESCENT",
    summaryZh:
      "在小角度近似下，爬升/下降梯度可写成 (T−D)/W 或 T/W 与升阻比 L/D 的组合；爬升率 RC 等于真空速乘以爬升角，下降率 RD 与真空速和升阻比成反比。",
    keywordsZh: ["爬升梯度", "下降梯度", "RC", "RD", "L/D"],
    keywordsEn: ["climb gradient", "descent gradient", "RC", "RD", "L/D"],
    tags: ["飞行力学", "爬升", "下降"],
    contentZh:
      "将爬升/下降角看作小角度时，有 sin(gamma) ≈ tan(gamma) ≈ gamma(rad)。结合受力平衡，可得到爬升梯度等于 (T−D)/W，并可写成推重比与升阻比的组合；再乘以真空速就得到爬升率 RC，而下降率 RD 与真空速和升阻比的乘积相关。",
    contentEn:
      "For small angles, climb or descent gradient is approximately (Thrust−Drag)/Weight and can be rewritten using thrust-to-weight ratio and L/D. Multiplying by TAS gives RC or RD.",
    formulas: [
      {
        id: "gamma-basic",
        latex: "gamma_rad = (T - D) / W",
        explainZh: ["以弧度表示的爬升/下降角"]
      },
      {
        id: "gamma-ld",
        latex: "gamma_rad = T/W - 1/(L/D)",
        explainZh: ["展示爬升梯度由推重比和升阻比共同决定"]
      },
      {
        id: "gamma-percent",
        latex: "gamma(%) = 100 * (T/W - 1/(L/D))",
        explainZh: ["以百分比形式给出的爬升/下降梯度"]
      },
      {
        id: "rc",
        latex: "RC = TAS * gamma_rad ≈ TAS * (T - D) / W",
        explainZh: ["RC：爬升率（垂直速度），与 TAS 及 (T−D)/W 成正比"]
      },
      {
        id: "rd",
        latex: "RD = - TAS * D / W = - TAS / (L/D)",
        explainZh: ["RD：下降率，在给定 TAS 下，L/D 越大，下降率越小"]
      }
    ],
    figures: []
  },

  // =====================================
  // A. BRAKE ENERGY – VMBE
  // =====================================
  {
    id: "brake-energy-vmbe",
    primaryType: "formula",
    titleZh: "刹车能量与 VMBE",
    titleEn: "Brake Energy and VMBE",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.2.2 MAXIMUM BRAKE ENERGY SPEED",
    summaryZh:
      "拒绝起飞时，刹车和气动阻力需要吸收飞机的动能，动能与重量和速度平方成正比，对应的限制速度定义为 VMBE。",
    keywordsZh: ["VMBE", "刹车能量", "拒绝起飞"],
    keywordsEn: ["VMBE", "brake energy"],
    tags: ["起飞", "限制"],
    contentZh:
      "在 V1 拒绝起飞时，需要刹车和阻力在有限距离内消散飞机的动能。动能与重量和速度平方成正比，因此在较高重量下稍微提高拒起速度都会显著增加刹车能量需求。认证时在磨损刹车条件下演示最大可承受能量，对应的限制速度为 VMBE。",
    contentEn:
      "At rejected takeoff, brakes and aerodynamic drag must absorb the aircraft kinetic energy, which grows with weight and the square of speed. The limiting speed is VMBE.",
    formulas: [
      {
        id: "brake-energy",
        latex: "E = 0.5 * Weight * V1^2",
        explainZh: ["拒绝起飞时需消散的动能，与重量和 V1 的平方成正比"]
      }
    ],
    figures: []
  },

  // =====================================
  // C. TAKEOFF – BALANCED FIELD LENGTH
  // =====================================
  {
    id: "balanced-field-length",
    primaryType: "formula",
    titleZh: "平衡场长概念",
    titleEn: "Balanced Field Length",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh:
      "平衡场长对应加速停飞距离和加速继续起飞距离在某一 V1 选择下相等的跑道长度，是确定限制起飞重量的重要概念。",
    keywordsZh: ["平衡场长", "加速停飞", "加速继续"],
    keywordsEn: ["balanced field", "accelerate-stop", "accelerate-go"],
    tags: ["起飞", "限制"],
    contentZh:
      "在给定重量和环境条件下，通过调整决断速度 V1，可以让加速停飞距离 ASD 与加速继续起飞距离 AGD 相等，此时得到的跑道长度称为平衡场长。若可用场长固定，则平衡场长对应的重量就是场长限制起飞重量。",
    contentEn:
      "Balanced field length is obtained when accelerate-stop distance equals accelerate-go distance for a given V1.",
    formulas: [
      {
        id: "bfl",
        latex: "ASD(V1) = AGD(V1)",
        explainZh: ["在平衡场长条件下，加速停飞距离与加速继续起飞距离相等"]
      }
    ],
    figures: []
  },

  // =====================================
  // D. IN FLIGHT – SPECIFIC RANGE
  // =====================================
  {
    id: "specific-range-and-max-range",
    primaryType: "formula",
    titleZh: "比航程与最大航程速度",
    titleEn: "Specific Range and Maximum Range Speed",
    chapter: "D. IN FLIGHT PERFORMANCE",
    section: "2. CRUISE",
    summaryZh:
      "比航程定义为单位燃油可飞行的距离，最大航程速度对应比航程曲线的峰值，是经济巡航和油量规划的基础概念。",
    keywordsZh: ["比航程", "最大航程速度"],
    keywordsEn: ["specific range", "maximum range"],
    tags: ["巡航", "燃油"],
    contentZh:
      "比航程 SR 等于真空速与燃油消耗率之比，反映单位燃油能飞多远。最大航程速度对应 SR 曲线的峰值，但日常运行通常选择略高于该速度的 LRC 或 ECON 速度，在航程和时间之间取得折中。",
    contentEn:
      "Specific range is the distance flown per unit of fuel. Maximum range speed corresponds to the maximum of the SR curve.",
    formulas: [
      {
        id: "specific-range",
        latex: "SR = V / fuel_burn_rate",
        explainZh: ["SR：比航程；V：真空速；fuel_burn_rate：燃油质量消耗率"]
      }
    ],
    figures: []
  },

  // =====================================
  // G. FUEL PLANNING – BASIC FUEL SCHEME
  // =====================================
  {
    id: "fuel-basic-scheme",
    primaryType: "formula",
    titleZh: "燃油规划基本构成与预备油",
    titleEn: "Basic Fuel Scheme and Reserves",
    chapter: "G. FUEL PLANNING AND MANAGEMENT",
    section: "1. FUEL PLANNING",
    summaryZh:
      "飞行计划中的起飞油量通常由航程油 Trip Fuel 和各类预备油组成：包括备降油、终端预备油 Final Reserve、备份裕度 Contingency Fuel 以及额外油 Additional Fuel。基本油量方案通过一组简单关系把这些部分串在一起。",
    keywordsZh: ["Trip Fuel", "Reserve Fuel", "Final Reserve", "Contingency Fuel"],
    keywordsEn: ["trip fuel", "reserve fuel", "final reserve", "contingency fuel"],
    tags: ["燃油", "规划"],
    contentZh:
      "起飞油量 Takeoff Fuel 一般由航程油 Trip Fuel 和预备油 Reserve Fuel 构成。预备油再细分为：目的地或备降机场的备降油 Alternate Fuel、终端预备油 Final Reserve Fuel、备份裕度 Contingency Fuel 以及针对特殊场景（如 ETOPS、孤立机场）的额外油 Additional Fuel。燃油规划需要保证在抵达目的地或备降机场时，剩余油量至少不低于终端预备油。",
    contentEn:
      "Takeoff fuel is composed of trip fuel and reserves. Reserves are broken down into alternate, final reserve, contingency and additional fuel. Remaining fuel at landing must be at least equal to the final reserve fuel.",
    formulas: [
      {
        id: "takeoff-fuel",
        latex: "TakeoffFuel = TripFuel + ReserveFuel",
        explainZh: ["起飞油量由航程油和各类预备油组成"]
      },
      {
        id: "reserve-fuel",
        latex:
          "ReserveFuel = AlternateFuel + FinalReserveFuel + ContingencyFuel + AdditionalFuel",
        explainZh: [
          "ReserveFuel：总预备油",
          "AlternateFuel：备降油",
          "FinalReserveFuel：终端预备油（例如 30–45 min 盘旋油）",
          "ContingencyFuel：备份裕度，用于应对风偏、ATC 等不确定性",
          "AdditionalFuel：额外油，用于满足特殊运行场景（如 ETOPS、孤立机场）"
        ]
      },
      {
        id: "final-reserve-easa",
        latex: "FinalReserveFuel_EASA = Fuel_30min_1500ft",
        explainZh: [
          "EASA 场景下，终端预备油通常按在 1500 ft 高度以等待速度飞行 30 min 计算",
          "适用于目的地或备降机场"
        ]
      },
      {
        id: "final-reserve-faa",
        latex: "FinalReserveFuel_FAA = Fuel_45min_cruise",
        explainZh: ["部分 FAA 场景下，终端预备油按正常巡航消耗 45 min 计算"]
      },
      {
        id: "contingency-basic",
        latex: "ContFuel_basic = max( 0.05 * TripFuel , Fuel_5min_1500ft )",
        explainZh: [
          "基础方案下，Contingency Fuel 取“计划航程油的 5%”与“1500 ft 盘旋 5 min 所需油量”中的较大者"
        ]
      },
      {
        id: "contingency-era",
        latex:
          "ContFuel_ERA = max( 0.03 * TripFuel_remaining , Fuel_20min_1500ft )",
        explainZh: [
          "使用 en-route alternate (ERA) 时，可将 5% 降为 3% 并至少保证 20 min 盘旋油量",
          "TripFuel_remaining：从关键点到目的地剩余的航程油"
        ]
      },
      {
        id: "fuel-remaining",
        latex: "Fuel_remaining_at_landing >= FinalReserveFuel",
        explainZh: [
          "落地时剩余油量通常要求不低于终端预备油",
          "这是许多公司运行手册定义的最低留油标准"
        ]
      }
    ],
    figures: []
  },

  // =====================================
  // G. FUEL PLANNING – ETOPS / 额外油量
  // =====================================
  {
    id: "etops-fuel-and-constraints",
    primaryType: "formula",
    titleZh: "ETOPS 运行的时间与油量约束",
    titleEn: "ETOPS Time and Fuel Constraints",
    chapter: "E. IN FLIGHT PERFORMANCE WITH FAILURE",
    section: "3. ETOPS FLIGHT",
    summaryZh:
      "ETOPS 运行需要同时满足时间和油量两方面约束：起飞备降在一定飞行时间内可达；航路上任一点到最近适当备降场的单发或失压改航时间不得超过批准的 ETOPS 时间；在最关键点，还需考虑发动机失效或失压情景下到备降场并等待的额外油量。",
    keywordsZh: ["ETOPS", "备降时间", "额外油量", "最关键点"],
    keywordsEn: ["ETOPS", "diversion time", "additional fuel", "critical point"],
    tags: ["巡航", "限制", "燃油"],
    contentZh:
      "对双发飞机，非 ETOPS 运行时起飞备降机场需在单发巡航 60 min 内可达；获 ETOPS 批准后，起飞备降时间上限可增至 120 min 或更高。沿航路，任意一点到最近适当备降场的单发或失压改航时间不得超过批准的 ETOPS 时间。燃油方面，在最关键点（critical point）必须至少保证：在发动机失效或失压情景下飞往选定的 en-route 备降场，按规定高度等待 15 min，并完成进近和着陆所需的油量，这部分通常用作 ETOPS 额外油量。",
    contentEn:
      "ETOPS operations are constrained by diversion time and fuel requirements. Takeoff alternates must be within specified OEI diversion times, and at any point along the route the diversion time to an adequate airport must not exceed the approved ETOPS time. At the most critical point, additional fuel must cover engine-failure or depressurization scenarios to an ERA, including a 15-minute hold and an approach and landing.",
    formulas: [
      {
        id: "takeoff-altn-time-twin",
        latex: "Time_to_TakeoffAlternate_twin_nonETOPS <= 60min@OEI",
        explainZh: [
          "双发非 ETOPS 运行：起飞备降机场需在单发巡航 60 min 内可达（无风条件、OEI 巡航速度）"
        ]
      },
      {
        id: "takeoff-altn-time-twin-etops",
        latex: "Time_to_TakeoffAlternate_twin_ETOPS <= 120min@OEI",
        explainZh: [
          "获得 ETOPS 运行批准后，双发起飞备降时间上限通常可放宽到单发巡航 120 min（具体取决于批文）"
        ]
      },
      {
        id: "takeoff-altn-time-four",
        latex: "Time_to_TakeoffAlternate_four_eng <= 120min@AEO",
        explainZh: [
          "四发飞机示例：起飞备降机场通常要求在所有发动机工作状态下 120 min 内可达"
        ]
      },
      {
        id: "route-diversion-time",
        latex: "DiversionTime_any_point <= Approved_ETOPS_Time",
        explainZh: [
          "航路上任一点到最近适当备降场的改航时间不得超过批准的 ETOPS 时间（例如 120 min / 180 min 等）"
        ]
      },
      {
        id: "etops-additional-fuel-basic",
        latex:
          "ExtraFuel_ETOPS >= Fuel(CP -> ERA) + Fuel_15min_hold_1500ft + Fuel_approach_landing",
        explainZh: [
          "CP：最关键点（critical point）",
          "ERA：选定的 en-route 备降机场",
          "需保证在发动机失效或失压情景下，到达 ERA、在 1500 ft 盘旋 15 min 并完成进近/着陆所需油量",
          "若常规 Trip+Reserve 油量不足以覆盖该情景，则需增加 ETOPS 额外油量"
        ]
      }
    ],
    figures: []
  },

  // =====================================
  // G. FUEL PLANNING – ISOLATED AERODROME
  // =====================================
  {
    id: "isolated-aerodrome-fuel",
    primaryType: "formula",
    titleZh: "孤立机场燃油规划 Isolated Aerodrome",
    titleEn: "Isolated Aerodrome Fuel Planning",
    chapter: "G. FUEL PLANNING AND MANAGEMENT",
    section: "1. ISOLATED AERODROME",
    summaryZh:
      "当目的地机场附近没有合适的备降场时，可以按“孤立机场”方案规划燃油：以目的地上空 2 小时正常巡航油量（包含终端预备油）作为基准，与常规“飞去最近备降场的备降油+终端预备油”比较，取较大者作为最低油量要求。",
    keywordsZh: ["孤立机场", "Isolated", "PNR", "燃油规划"],
    keywordsEn: ["isolated aerodrome", "PNR", "fuel planning"],
    tags: ["燃油", "规划", "特殊运行"],
    contentZh:
      "孤立机场场景下，目的地附近没有合适的目的地备降场。此时不再规划常规目的地备降机场，而是以目的地上空 2 小时正常巡航油量（包含终端预备油）作为一条基线，与“飞去最近合适备降场的备降油 + 终端预备油”进行比较：如果后者更大，则目的地应视为孤立机场并按孤立机场方案配油。飞行计划中还需要给出不可返航点 PNR，并在 PNR 点检查剩余油量是否满足“从 PNR 飞到孤立机场 + 该航段的预备油 + 孤立机场附加油量”的下限。",
    contentEn:
      "For isolated aerodromes, no destination alternate is planned. The required fuel is based on the greater of two quantities: the fuel to reach the nearest adequate alternate plus final reserve, or the fuel to fly for 2 hours at normal cruise consumption overhead destination including final reserve. A point of no return (PNR) is defined and the fuel at PNR must be sufficient to continue to the isolated aerodrome with the appropriate reserves and additional fuel.",
    formulas: [
      {
        id: "isolated-trigger",
        latex:
          "AltFuel_to_nearest + FinalReserveFuel > Fuel_2h_cruise_over_dest_incl_FRF",
        explainZh: [
          "当“飞去最近合适备降场的备降油 + 终端预备油”大于“目的地上空 2 小时正常巡航油量（含终端预备油）”时，可将目的地视为孤立机场",
          "AltFuel_to_nearest：飞往最近合适目的地备降场的备降油",
          "Fuel_2h_cruise_over_dest_incl_FRF：目的地上空 2 小时正常巡航油量，包含终端预备油 FRF"
        ]
      },
      {
        id: "isolated-total-fuel",
        latex:
          "RequiredFuel_isolated >= TaxiFuel + TripFuel(DEP->Isolated via PNR) + ContingencyFuel + Isolated_AddFuel",
        explainZh: [
          "TaxiFuel：滑行油",
          "TripFuel(DEP->Isolated via PNR)：从起飞机场经 PNR 飞到孤立机场的航程油",
          "ContingencyFuel：按当前方案计算的备份裕度",
          "Isolated_AddFuel：孤立机场附加油量，通常不小于目的地上空 2 小时正常巡航油量（含 FRF）",
          "实际运行时还可叠加 Extra Fuel，应对预计延误或特殊约束"
        ]
      },
      {
        id: "isolated-pnr-check",
        latex:
          "Fuel_remaining_at_PNR >= TripFuel(PNR->Isolated) + ContingencyFuel(PNR->Isolated) + Isolated_AddFuel",
        explainZh: [
          "PNR：不可返航点，超过此点后继续前往孤立机场比返航或改航更有利",
          "在实际 PNR 点检查剩余油量是否足以飞到孤立机场并满足该航段预备油和孤立机场附加油量",
          "若不足，则应在 PNR 前转向备用 ERA 机场"
        ]
      }
    ],
    figures: []
  },

  // =====================================
  // G. FUEL PLANNING – REDISPATCH / RCF
  // =====================================
  {
    id: "redispatch-rcf-fuel",
    primaryType: "formula",
    titleZh: "再放派 / RCF 关键点燃油条件",
    titleEn: "Redispatch / RCF Critical Point Fuel Conditions",
    chapter: "G. FUEL PLANNING AND MANAGEMENT",
    section: "2. REDISPATCH / RCF",
    summaryZh:
      "再放派（Redispatch / RCF）通过在航路上设置一个决策点 B，将长航程拆分为两段：从起飞机场到决策点按较低备份裕度规划；通过 B 点后再重新放行至最终目的地。RCF 程序要求在决策点检查剩余油量是否至少等于“继续飞往目标目的地”和“返航或改飞备降场”方案中要求油量的较大者。",
    keywordsZh: ["再放派", "RCF", "Redispatch", "决策点", "Critical Point"],
    keywordsEn: ["redispatch", "RCF", "decision point", "critical point"],
    tags: ["燃油", "规划", "长航程"],
    contentZh:
      "在再放派方案中，飞行计划将航程拆分为 A→B→C：A 为起飞机场，B 为决策点（RCF 点），C 为最终目的地。起飞时按照 A→B→C 的航线规划燃油，但部分备份油量可以只按 B→C 航段的 5% 或 3% 计算。为保证安全，在 B 点必须检查剩余油量是否大于等于“继续飞往目的地 C”的方案油量与“改飞其他机场（如出发地或 ERA 机场）”方案油量中的较大者；若条件不满足，则按照预先计划的改航方案执行。",
    contentEn:
      "In a redispatch (RCF) scheme, the route is split into segments A–B–C with a decision point B. At B, the remaining fuel must be at least equal to the greater of the fuel required to continue to destination C and the fuel required to divert to an alternate or return to A, including the appropriate reserves.",
    formulas: [
      {
        id: "rcf-fuel-to-dest",
        latex:
          "Fuel_req_continue = TripFuel(B->C) + ContingencyFuel(B->C) + AlternateFuel_C + FinalReserveFuel + AdditionalFuel_RCF",
        explainZh: [
          "继续飞往最终目的地 C 所需的油量，包括：B→C 航程油、该航段的备份油、目的地备降油、终端预备油以及与 RCF 相关的额外油量",
          "AlternateFuel_C：目的地 C 的备降油（若需要）"
        ]
      },
      {
        id: "rcf-fuel-to-alt",
        latex:
          "Fuel_req_divert = TripFuel(B->Alt) + ContingencyFuel(B->Alt) + FinalReserveFuel + AdditionalFuel_divert",
        explainZh: [
          "从 B 点改飞备选机场（如出发地 A 或 en-route ERA 机场）所需油量",
          "AdditionalFuel_divert：与该改航情景相关的额外油量（如地形或特殊程序）"
        ]
      },
      {
        id: "rcf-decision-condition",
        latex:
          "Fuel_remaining_at_B >= max( Fuel_req_continue , Fuel_req_divert )",
        explainZh: [
          "再放派程序的核心条件：在决策点 B，剩余油量必须不小于“继续飞往 C”和“改飞其他机场”两种方案所需油量中的较大者",
          "若条件满足，可继续飞往目的地 C；否则应执行预先计划的改航/返航方案"
        ]
      }
    ],
    figures: []
  }
];

module.exports = aircraftPerformanceFormulaCards;
