// 飞机性能条目数据（示例）
// 数据源：Airbus Getting to Grips with Aircraft Performance v2

const aircraftPerformanceEntries = [
  // =============================
  // A. AIRCRAFT LIMITATIONS
  // =============================
  {
    id: "a-1-1-load-factor",
    primaryType: "definition",
    titleZh: "载荷因数",
    titleEn: "Load Factor",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.1 LOAD FACTORS",
    summaryZh: "载荷因数是升力与飞机重量之比，用于衡量飞行中结构所承受的附加载荷，是飞行包线和重量/速度限制的基础概念。",
    keywordsZh: ["载荷因数", "荷载因数", "n_z", "飞行载荷"],
    keywordsEn: ["load factor", "nz", "flight loads"],
    tags: ["基础概念", "飞行包线"],
    regulationRefs: ["CS 25.321", "FAR 25.321"],
    contentZh: "载荷因数（n_z）定义为升力与飞机重量之比，反映飞机在机动或乱流中结构所承受的附加载荷。当 n_z = 1 时，对应平飞；大于 1 对应转弯、拉起等机动；小于 1 对应减载或负载。\n\n适航规章为载荷因数规定了设计极限值和安全裕度，飞行中必须在这些限制范围内运行，以避免结构永久变形或失效。",
    contentEn: "Flight load factors represent the ratio of the aerodynamic force component acting normal to the airplane longitudinal axis to the airplane weight. A positive load factor corresponds to an upward aerodynamic force. The structure is designed for specified limit and ultimate load factors defined in CS/FAR 25.321.",
    formulas: [
      {
        id: "nz-lift-weight",
        latex: "n_z = \\frac{Lift}{Weight}",
        explainZh: [
          "n_z：载荷因数",
          "Lift：升力",
          "Weight：飞机重量"
        ]
      },
      {
        id: "apparent-weight",
        latex: "W_a = n_z \\, m \\, g = Lift",
        explainZh: [
          "W_a：表观重量（机组感觉到的重量）",
          "m：飞机质量，g：重力加速度",
          "当 n_z ≠ 1 时，表观重量不同于实际重量 mg，等于升力 L"
        ]
      }
    ],
    figures: []
  },
  {
    id: "a-1-1-limit-ultimate-loads",
    primaryType: "definition",
    titleZh: "极限载荷与破坏载荷",
    titleEn: "Limit and Ultimate Loads",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.1 LOAD FACTORS",
    summaryZh: "适航条款通过“极限载荷”和“破坏载荷”来规定结构强度，通常以 1.5 的安全系数建立强度裕度。",
    keywordsZh: ["极限载荷", "破坏载荷", "安全系数"],
    keywordsEn: ["limit load", "ultimate load", "factor of safety"],
    tags: ["基础概念", "限制"],
    regulationRefs: ["CS 25.301", "FAR 25.301"],
    contentZh: "极限载荷（Limit load）是飞机在正常运行中预计可能遇到的最大载荷，结构必须在极限载荷下保持弹性变形、不产生永久损伤。破坏载荷（Ultimate load）通常为极限载荷乘以规定的安全系数，用于验证结构在极端工况下仍具有足够裕度。\n\nCS/FAR 25.301 要求：除非另有说明，规定的载荷为极限载荷；破坏载荷一般等于极限载荷乘以 1.5 的安全系数。",
    contentEn: "Limit loads correspond to the maximum loads expected in service. Ultimate loads are obtained by multiplying limit loads by a prescribed factor of safety, usually 1.5. The structure must withstand ultimate loads without failure.",
    formulas: [
      {
        id: "ultimate-load-factor",
        latex: "Ultimate\\ load = Limit\\ load \\times 1.5",
        explainZh: ["运输类飞机通常采用 1.5 作为结构安全系数。"]
      }
    ],
    figures: []
  },
  {
    id: "a-1-1-vn-envelope",
    primaryType: "definition",
    titleZh: "机动包线（V-n 图）",
    titleEn: "Manoeuvring Diagram (V-n Envelope)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.1 LOAD FACTORS",
    summaryZh: "V-n 图以空速和载荷因数为坐标，给出结构允许的最大/最小载荷与速度组合，是飞行操作的总览“红线图”。",
    keywordsZh: ["V-n 图", "机动包线", "飞行包线"],
    keywordsEn: ["V-n diagram", "manoeuvring envelope"],
    tags: ["飞行包线", "限制"],
    regulationRefs: ["CS 25.333", "CS 25.337"],
    contentZh: "机动包线（V-n 图）以飞行速度为横轴、载荷因数 n 为纵轴，显示飞机在清洁构型下允许的正、负载荷范围以及对应的速度限制。图中包括：失速边界、最大使用速度/马赫数、乱流载荷限制等。飞行员必须在包线内部操作飞机，以避免超过认证结构极限。",
    contentEn: "The manoeuvring diagram, or V-n envelope, plots permissible combinations of airspeed and load factor. It shows stall boundaries and structural limits. Normal operation must remain inside the certified envelope.",
    formulas: [],
    figures: []
  },
  {
    id: "a-2-1-structural-weights",
    primaryType: "definition",
    titleZh: "最大/最小结构重量",
    titleEn: "Maximum and Minimum Structural Weights",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "2. MAXIMUM STRUCTURAL WEIGHTS / 3. MINIMUM STRUCTURAL WEIGHT",
    summaryZh: "最大结构重量（起飞、着陆、无燃油等）和最小结构重量由制造商根据强度与操纵品质确定，是所有运营重量限制的基础。",
    keywordsZh: ["最大起飞重量", "最大着陆重量", "最大无燃油重量", "最小结构重量", "MTOW", "MLW", "MZFW"],
    keywordsEn: ["MTOW", "MLW", "MZFW", "minimum structural weight"],
    tags: ["基础概念", "限制"],
    regulationRefs: [],
    contentZh: "最大结构滑行重量、最大结构起飞重量（MTOW）、最大结构着陆重量（MLW）、最大无燃油重量（MZFW）和最小结构重量由制造商根据强度、疲劳和操纵品质确定。运营重量不得超过相应结构限制；过低重量则可能导致配平和操纵品质不满足要求。",
    contentEn: "Maximum structural taxi, takeoff, landing and zero fuel weights, as well as a minimum structural weight, are defined by the manufacturer. Operational weights must not exceed the corresponding structural limits.",
    formulas: [],
    figures: []
  },
  {
    id: "a-4-1-environment-envelope",
    primaryType: "definition",
    titleZh: "环境包线（高度/温度）",
    titleEn: "Environmental Envelope (Altitude/Temperature)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "4. ENVIRONMENTAL ENVELOPE",
    summaryZh: "环境包线定义飞机在压力高度和外界温度上的运行范围，包括最大运行高度、起飞/着陆高度限制以及高温/低温边界。",
    keywordsZh: ["环境包线", "高度限制", "温度限制"],
    keywordsEn: ["environmental envelope", "operating altitude"],
    tags: ["基础概念", "限制"],
    regulationRefs: [],
    contentZh: "环境包线描述飞机允许运行的高度和温度组合，包括：最大运行高度、起飞/着陆最大机场高度、最低温度限制以及高温 ISA 偏差限制。在包线之外，发动机推力、增压与防冰能力可能无法满足要求，因此飞行计划需检查当日条件是否位于包线之内。",
    contentEn: "The environmental envelope defines the combinations of pressure altitude and outside air temperature within which the aircraft is approved to operate.",
    formulas: [],
    figures: []
  },
  {
    id: "a-1-2-vmo-mmo",
    primaryType: "definition",
    titleZh: "最大使用速度/马赫数 VMO/MMO",
    titleEn: "Maximum Operating Speed/Mach (VMO/MMO)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.2 MAXIMUM SPEEDS",
    summaryZh: "VMO/MMO 是飞行中不可超过的最大使用速度或马赫数，在 PFD 上以红线标示，用于保护结构强度和抖振裕度。",
    keywordsZh: ["VMO", "MMO", "最大使用速度", "红线速度"],
    keywordsEn: ["VMO", "MMO", "maximum operating speed"],
    tags: ["限制", "飞行包线"],
    regulationRefs: ["CS 25.1505", "FAR 25.1505"],
    contentZh: "VMO（最大使用速度）和 MMO（最大使用马赫数）定义了飞机在正常营运中允许的最高速度。超过该速度可能导致结构载荷超限、机翼颤振接近或飞行品质显著恶化。在 PFD 上，VMO/MMO 以红色条或红黑斜纹显示，是飞行员必须严格遵守的“不可超越速度”。",
    contentEn: "VMO/MMO are the maximum operating speed and Mach number. They represent the upper limit of the approved operating envelope and are shown as a red line on the primary flight display.",
    formulas: [],
    figures: []
  },
  {
    id: "a-1-2-vfe",
    primaryType: "definition",
    titleZh: "最大放襟翼速度 VFE",
    titleEn: "Maximum Flap Extended Speed (VFE)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.2 MAXIMUM SPEEDS",
    summaryZh: "VFE 对应各挡襟翼/缝翼构型允许的最大放襟翼速度（最大指示空速），用于保护高升力装置及其结构。",
    keywordsZh: ["VFE", "最大放襟翼速度", "襟翼限制速度"],
    keywordsEn: ["VFE", "flap extended speed"],
    tags: ["限制", "起飞", "着陆"],
    regulationRefs: ["CS 25.1519", "FAR 25.1519"],
    contentZh: "最大放襟翼速度 VFE 是指在相应襟翼/缝翼构型下允许的最大放襟翼速度（最大指示空速）。超过 VFE 运行可能导致高升力装置结构超载或作动机构损伤。各挡构型具有不同的 VFE 数值，并通过 PFD 和速度卡清晰标注。",
    contentEn: "VFE is the maximum speed permissible with the flaps or slats in a given configuration. Exceeding VFE may damage the high-lift system.",
    formulas: [],
    figures: []
  },
  {
    id: "a-1-2-vlo-vle",
    primaryType: "definition",
    titleZh: "最大起落架使用速度/最大放起落架速度 VLO/VLE",
    titleEn: "Landing Gear Operating and Extended Speeds (VLO/VLE)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.2 MAXIMUM SPEEDS",
    summaryZh: "VLO 为最大起落架使用速度（起落架收放时允许的最大速度），VLE 为最大放起落架速度（起落架放下后允许的最大飞行速度），用于保护起落架结构及舱门。",
    keywordsZh: ["VLO", "VLE", "最大起落架使用速度", "最大放起落架速度"],
    keywordsEn: ["VLO", "VLE", "landing gear speed"],
    tags: ["限制", "起飞", "着陆"],
    regulationRefs: ["CS 25.1515", "FAR 25.1515"],
    contentZh: "最大起落架使用速度 VLO（Landing Gear Operating Speed）是起落架安全收放时允许的最大空速；若收放速度不同，可分为 VLO EXT（放下时）和 VLO RET（收上时）。最大放起落架速度 VLE（Landing Gear Extended Speed）是起落架已放下并锁定时允许运行的最大空速。运行中在执行收放动作前，应检查当前空速是否满足这些限制。",
    contentEn: "VLO is the maximum speed for landing gear operation (extension and retraction). VLE is the maximum speed with the landing gear locked down.",
    formulas: [],
    figures: []
  },
  {
    id: "a-1-2-vmbe",
    primaryType: "formula",
    titleZh: "最大刹车能量速度 VMBE",
    titleEn: "Maximum Brake Energy Speed (VMBE)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.2.2 MAXIMUM BRAKE ENERGY SPEED",
    summaryZh: "VMBE 对应在拒绝起飞时刹车所能吸收的最大动能，限制了在给定重量下允许的最高拒起速度。",
    keywordsZh: ["VMBE", "刹车能量", "拒绝起飞"],
    keywordsEn: ["VMBE", "brake energy"],
    tags: ["起飞", "限制"],
    regulationRefs: ["CS 25.109", "FAR 25.109"],
    contentZh: "在拒绝起飞时，刹车和空气阻力需要吸收飞机的动能。刹车有最大可吸收能量的限制，认证时在磨损刹车条件下演示。对应某一重量，若在更高速度拒起，会超过刹车能量能力，从而可能导致刹车过热或损坏。该限制速度被定义为 VMBE。",
    contentEn: "VMBE is the maximum speed from which a rejected takeoff can be performed without exceeding the brake energy capacity at a given weight.",
    formulas: [
      {
        id: "kinetic-energy-v1",
        latex: "E = \\tfrac{1}{2} \\cdot W \\cdot V^2",
        explainZh: ["拒绝起飞时需要消散的动能与重量和速度平方成正比。"]
      }
    ],
    figures: []
  },
  {
    id: "a-1-2-vtire",
    primaryType: "definition",
    titleZh: "轮胎最大速度 VTIRE",
    titleEn: "Maximum Tire Speed (VTIRE)",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "1.2.3 MAXIMUM TIRE SPEED",
    summaryZh: "VTIRE 由轮胎制造商给出，以地速表示，用于限制起飞/落地时轮胎所承受的离心力和热载荷。",
    keywordsZh: ["VTIRE", "轮胎速度"],
    keywordsEn: ["tire speed"],
    tags: ["起飞", "着陆", "限制"],
    regulationRefs: [],
    contentZh: "轮胎最大速度 VTIRE 是轮胎制造商限定的最大地速，目的是限制轮胎结构所承受的离心力和温度。认证起飞与落地速度必须保证不超过 VTIRE。在性能图中，VTIRE 会以针对各机型的最大起飞地速给出。",
    contentEn: "The tire manufacturer specifies a maximum ground speed VTIRE to protect tire structure from excessive centrifugal and thermal stresses.",
    formulas: [
      {
        id: "vlof-vtire-limit",
        latex: "V_{LOF} \\leq V_{TIRE}",
        explainZh: [
          "V_{LOF}：抬离速度（轮子刚离地时的校正空速）",
          "V_{TIRE}：轮胎制造商给出的最大允许地速",
          "起飞和着陆时的地速必须保证不超过 V_{TIRE}"
        ]
      }
    ],
    figures: []
  },

  // =============================
  // B. OPERATING SPEEDS
  // =============================
  {
    id: "b-1-1-ias-tas-mach",
    primaryType: "definition",
    titleZh: "指示空速 IAS / 真空速 TAS / 马赫数 M",
    titleEn: "IAS, TAS and Mach Number",
    chapter: "B. OPERATING SPEEDS",
    section: "1. COMMON SPEEDS",
    summaryZh: "IAS 用于操纵与限制，TAS 用于导航与性能计算，马赫数描述飞机速度与当地音速的比值，是高空高速飞行的主要限制量。",
    keywordsZh: ["IAS", "TAS", "马赫数", "音速"],
    keywordsEn: ["IAS", "TAS", "Mach"],
    tags: ["基础概念", "巡航"],
    regulationRefs: [],
    contentZh: "指示空速 IAS 由动态压与静压差直接转换而来，是飞行员在 PFD 上看到的速度，用于操纵感觉和速度限制。真空速 TAS 在导航和油量计算中使用，考虑了高度和温度对空气密度的影响。马赫数 M 是飞机真空速与当地音速之比，高空接近音速飞行时，以马赫数进行保护与限制。",
    contentEn: "IAS is the speed read on the airspeed indicator and is used for handling and limitations. TAS is the speed of the aircraft relative to the airmass and is used for navigation and performance. Mach number is the ratio of TAS to the local speed of sound.",
    formulas: [
      {
        id: "mach-definition",
        latex: "M = \\frac{V_{TAS}}{a}",
        explainZh: ["M：马赫数", "V_TAS：真空速", "a：当地音速"]
      }
    ],
    figures: []
  },
  {
    id: "b-1-2-vs-vsr",
    primaryType: "definition",
    titleZh: "失速速度 VS / 参考失速速度 VSR",
    titleEn: "Stall Speed VS and Reference Stall Speed VSR",
    chapter: "B. OPERATING SPEEDS",
    section: "1. COMMON SPEEDS",
    summaryZh: "VS 是给定构型下的实际失速速度，VSR 是为认证统一而定义的参考失速速度，是起飞和着陆速度限制的基础。",
    keywordsZh: ["VS", "VSR", "失速速度"],
    keywordsEn: ["VS", "VSR", "stall speed"],
    tags: ["基础概念", "限制"],
    regulationRefs: [],
    contentZh: "失速速度 VS 通过试飞测定，对应机翼刚失速时的校正空速。VSR 在 CS/FAR 25 中有严格定义，用于统一不同构型、不同机型下的失速基准。起飞安全速度 V2、着陆基准速度 VREF 等均以 VSR 为基础倍数确定。",
    contentEn: "VS is the stall speed for a given configuration and weight. VSR is a reference stall speed defined in the certification rules and used as a basis for other limiting speeds such as V2 and VREF.",
    formulas: [],
    figures: []
  },
  {
    id: "b-1-3-green-dot",
    primaryType: "definition",
    titleZh: "绿色点速度（Green Dot）",
    titleEn: "Green Dot Speed",
    chapter: "B. OPERATING SPEEDS",
    section: "1. COMMON SPEEDS",
    summaryZh: "Green Dot 在清洁构型下接近最佳升阻比速度，是单发漂降、单发爬升和经济爬升的关键参考速度。",
    keywordsZh: ["绿色点", "Green Dot", "最佳升阻比"],
    keywordsEn: ["green dot", "best lift-to-drag"],
    tags: ["爬升", "巡航", "基础概念"],
    regulationRefs: [],
    contentZh: "PFD 上的绿色小圆点（Green Dot）在清洁构型下接近最佳升阻比速度，对应单位高度损失所能飞行的水平距离最大。发动机失效漂降、单发爬升以及部分节油飞行方案都会使用 Green Dot 作为目标速度或基准。",
    contentEn: "The green dot speed is close to the best lift-to-drag ratio speed in clean configuration. It is a key reference for engine-out drift-down and climb.",
    formulas: [],
    figures: []
  },

  // --- B.2 TAKEOFF SPEEDS ---
  {
    id: "b-2-1-v1-decision-speed",
    primaryType: "definition",
    titleZh: "决断速度 V1",
    titleEn: "Decision Speed (V1)",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh: "V1 是机组在起飞滑跑中作出“继续/中止起飞”决断的界限速度，是平衡场长概念的核心参数。",
    keywordsZh: ["V1", "决断速度", "起飞决定速度"],
    keywordsEn: ["V1", "decision speed"],
    tags: ["起飞", "限制"],
    regulationRefs: ["CS 25.107", "CS 25.111", "CS 25.113"],
    contentZh: "V1 定义为：在该速度及以下，若发生故障，可以在可用加速-停飞距离 ASDA 内安全停住；在该速度以及之后，假定必须继续起飞并满足单发爬升和越障要求。性能计算通过平衡“加速-停飞”和“加速-继续”两段距离来确定合适的 V1。",
    contentEn: "V1 is the maximum speed at which the first action must be taken to stop the aeroplane within the accelerate-stop distance, and the minimum speed at which, after a failure, the takeoff can be safely continued.",
    formulas: [],
    figures: []
  },
  {
    id: "b-2-2-vr-rotate-speed",
    primaryType: "definition",
    titleZh: "抬轮速度 VR",
    titleEn: "Rotation Speed (VR)",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh: "VR 是机组开始抬机头的速度，需兼顾跑道长度、单发爬升性能与尾部离地间隙。",
    keywordsZh: ["VR", "抬轮速度"],
    keywordsEn: ["VR", "rotation speed"],
    tags: ["起飞"],
    regulationRefs: [],
    contentZh: "抬轮速度 VR 不得低于若干倍数的参考失速速度，同时要保证在发动机失效情况下，继续起飞仍能满足爬升梯度和尾部不擦地的要求。性能图会针对不同重量与襟翼构型给出建议 VR 值。",
    contentEn: "VR is the speed at which the pilot initiates rotation. It is chosen to provide adequate stall margin, tail clearance and engine-out climb performance.",
    formulas: [],
    figures: []
  },
  {
    id: "b-2-3-v2-takeoff-safety-speed",
    primaryType: "definition",
    titleZh: "起飞安全速度 V2",
    titleEn: "Takeoff Safety Speed (V2)",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh: "V2 是单发起飞爬升阶段应保持的最低安全速度，保证规定的爬升梯度和失速裕度。",
    keywordsZh: ["V2", "起飞安全速度"],
    keywordsEn: ["V2", "takeoff safety speed"],
    tags: ["起飞", "爬升", "限制"],
    regulationRefs: [],
    contentZh: "V2 通常在越过起飞屏障高度（例如 35 ft）时达到或略高于该值，并在单发爬升阶段保持。它以参考失速速度 VSR 为基础，保证足够的失速裕度和舵面控制能力。",
    contentEn: "V2 is the minimum speed that must be reached at the screen height with one engine inoperative. It provides the required climb gradient and stall margin.",
    formulas: [],
    figures: []
  },
  {
    id: "b-2-4-vmcg",
    primaryType: "definition",
    titleZh: "地面最小操纵速度 VMCG",
    titleEn: "Minimum Control Speed on the Ground (VMCG)",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh: "VMCG 是在最不利条件下，关键发动机突然失效时，仅依靠气动舵面而不使用前轮转向仍能保持跑道偏离在限制内的最低速度。",
    keywordsZh: ["VMCG", "地面最小操纵速度"],
    keywordsEn: ["VMCG", "minimum control speed on the ground"],
    tags: ["起飞", "限制"],
    regulationRefs: ["CS 25.149", "FAR 25.149"],
    contentZh: "在确定 VMCG 时，假定飞机沿跑道中线加速，在关键发动机突然失效后，仅使用方向舵等气动舵面进行控制，不使用前轮转向，要求飞机在恢复到与中线平行之前横向偏离不超过规定值。低于 VMCG 的速度下，方向舵不足以抵消偏航力矩，因此不允许继续起飞。",
    contentEn: "VMCG is the minimum speed on the ground at which, when the critical engine suddenly becomes inoperative, it is possible to maintain directional control using only aerodynamic controls within a specified lateral deviation.",
    formulas: [],
    figures: []
  },
  {
    id: "b-2-5-vmca",
    primaryType: "definition",
    titleZh: "空中最小操纵速度 VMCA",
    titleEn: "Minimum Control Speed in the Air (VMCA)",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh: "VMCA 是空中在关键发动机失效时，依靠最大舵偏转仍能维持方向控制且侧倾角不超过规定的最低速度。",
    keywordsZh: ["VMCA", "空中最小操纵速度"],
    keywordsEn: ["VMCA", "minimum control speed in the air"],
    tags: ["起飞", "限制"],
    regulationRefs: ["CS 25.149", "FAR 25.149"],
    contentZh: "VMCA 在最不利构型、重心和推力设置下评估。要求在关键发动机突然失效后，飞机能够在不超过 5° 的侧倾角下维持直飞，并且在恢复过程中不出现危险姿态或需要异常大的舵力。运营中，起飞初始爬升速度必须明显高于 VMCA。",
    contentEn: "VMCA is the minimum speed in the air at which, following failure of the critical engine, it is possible to maintain control with not more than a 5° bank angle and without requiring exceptional pilot skill.",
    formulas: [],
    figures: []
  },
  {
    id: "b-2-6-vmu",
    primaryType: "definition",
    titleZh: "最小抬离速度 VMU",
    titleEn: "Minimum Unstick Speed (VMU)",
    chapter: "B. OPERATING SPEEDS",
    section: "2. TAKEOFF SPEEDS",
    summaryZh: "VMU 是在不发生尾擦并保持可接受爬升能力的前提下，飞机能够安全抬离并继续起飞的最低速度。",
    keywordsZh: ["VMU", "最小起飞速度", "最小抬离速度", "尾擦"],
    keywordsEn: ["VMU", "minimum unstick speed"],
    tags: ["起飞", "限制"],
    regulationRefs: ["CS 25.107", "FAR 25.107"],
    contentZh: "VMU 通过试飞评估，通常在机尾接近跑道但不接触的极限姿态下测得。为保证安全，VR 与 V2 需高于 VMU 的一定倍数，从而兼顾尾部间隙和离地后的爬升性能。",
    contentEn: "VMU is the lowest speed at which the aeroplane can safely lift off and continue the takeoff without tailstrike and with acceptable climb performance.",
    formulas: [],
    figures: []
  },

  // --- B.3 LANDING SPEEDS ---
  {
    id: "b-3-1-vref",
    primaryType: "definition",
    titleZh: "着陆基准速度 VREF",
    titleEn: "Reference Landing Speed (VREF)",
    chapter: "B. OPERATING SPEEDS",
    section: "3. LANDING SPEEDS",
    summaryZh: "VREF 通常定义为着陆构型下某一倍数的参考失速速度，是着陆性能计算和限距判定的基准。",
    keywordsZh: ["VREF", "着陆基准速度"],
    keywordsEn: ["VREF", "reference landing speed"],
    tags: ["着陆", "限制"],
    regulationRefs: [],
    contentZh: "着陆性能图以 VREF 为基准，要求在越过跑道门槛时保持接近 VREF 的速度。进近目标速度 VAPP 一般在 VREF 基础上加上风修正等裕度，用于兼顾失速保护和风切变风险。",
    contentEn: "VREF is the reference landing speed used for landing distance calculations. It is usually a multiple of VSR in landing configuration.",
    formulas: [],
    figures: []
  },
  {
    id: "b-3-2-vapp",
    primaryType: "definition",
    titleZh: "进近速度 VAPP",
    titleEn: "Final Approach Speed (VAPP)",
    chapter: "B. OPERATING SPEEDS",
    section: "3. LANDING SPEEDS",
    summaryZh: "VAPP 在 VLS 以上、VFE 以下，一般等于 VREF 加风修正，用于保证进近过程的操纵余量和抗风切变能力。",
    keywordsZh: ["VAPP", "进近速度"],
    keywordsEn: ["VAPP", "approach speed"],
    tags: ["进近", "着陆"],
    regulationRefs: [],
    contentZh: "机组根据 FMS 计算或速度表，在 VREF 基础上叠加逆风的一部分以及全顺风分量得到 VAPP，并受最小/最大修正量限制。选择合适的 VAPP 能在保持足够失速裕度的同时，避免过高速度导致落地距离增加。",
    contentEn: "VAPP is the target final approach speed, usually equal to VREF plus wind correction within specified limits.",
    formulas: [],
    figures: []
  },
  {
    id: "b-3-3-vls",
    primaryType: "definition",
    titleZh: "最小可选速度 VLS",
    titleEn: "Lowest Selectable Speed (VLS)",
    chapter: "B. OPERATING SPEEDS",
    section: "3. LANDING SPEEDS",
    summaryZh: "VLS 是自动/飞行指引系统允许的最低目标速度，在 PFD 上以琥珀色标记，用于提供对失速的保护裕度。",
    keywordsZh: ["VLS", "最小可选速度"],
    keywordsEn: ["VLS", "lowest selectable speed"],
    tags: ["进近", "着陆", "限制"],
    regulationRefs: [],
    contentZh: "在进近和着陆阶段，飞控系统不允许将目标速度设置低于 VLS。VLS 与当前构型下的失速参考速度相关，确保在任何情况下都有规定的失速裕度。若速度接近 VLS，自动推力或保护功能会介入以防进一步减速。",
    contentEn: "VLS is the lowest speed that can be selected as a target. It is displayed on the PFD and provides a margin above stall.",
    formulas: [],
    figures: []
  },
  {
    id: "b-3-4-vmcl",
    primaryType: "definition",
    titleZh: "进近/着陆最小操纵速度 VMCL/VMCL-2",
    titleEn: "Minimum Control Speeds during Approach and Landing (VMCL / VMCL-2)",
    chapter: "B. OPERATING SPEEDS",
    section: "3. LANDING SPEEDS",
    summaryZh: "VMCL 和 VMCL-2 分别对应所有发动机工作以及一发已失效情况下，在进近/着陆构型下仍能保持方向控制的最低速度。",
    keywordsZh: ["VMCL", "VMCL-2", "最小操纵速度"],
    keywordsEn: ["VMCL", "VMCL-2"],
    tags: ["进近", "着陆", "限制"],
    regulationRefs: ["CS 25.149", "FAR 25.149"],
    contentZh: "VMCL 是在进近构型、所有发动机工作的条件下，关键发动机突然失效时仍能保持方向控制并限制侧倾角的最低速度。对于三发及以上飞机，还定义 VMCL-2，用于一发已失效时第二发再失效的情况。进近速度必须高于这些限制。",
    contentEn: "VMCL and VMCL-2 are minimum control speeds defined for approach and landing configurations with all engines operating or with one engine already inoperative.",
    formulas: [],
    figures: []
  },

  // --- B.4 CRUISE SPEEDS ---
  {
    id: "b-4-1-econ-speed",
    primaryType: "definition",
    titleZh: "经济巡航速度 ECON",
    titleEn: "ECON Cruise Speed",
    chapter: "B. OPERATING SPEEDS",
    section: "4. CRUISE SPEEDS",
    summaryZh: "ECON 速度综合考虑燃油成本与时间成本，通过成本指数 CI 由 FMS 自动计算，是日常运行中最常用的巡航速度。",
    keywordsZh: ["ECON 速度", "成本指数", "CI"],
    keywordsEn: ["ECON", "cost index"],
    tags: ["巡航", "燃油"],
    regulationRefs: [],
    contentZh: "飞行管理系统根据成本指数（Cost Index，燃油价格与时间价值的比值）以及当前重量、高度、风等条件，计算经济巡航速度 ECON。CI 越大越偏向节省时间，CI 越小越偏向节省燃油。",
    contentEn: "The ECON speed is computed by the FMS as a function of cost index, representing the trade-off between fuel and time costs.",
    formulas: [],
    figures: []
  },
  {
    id: "b-4-2-lrc-speed",
    primaryType: "definition",
    titleZh: "最长航程巡航速度 LRC",
    titleEn: "Long Range Cruise (LRC) Speed",
    chapter: "B. OPERATING SPEEDS",
    section: "4. CRUISE SPEEDS",
    summaryZh: "LRC 在牺牲少量航程的前提下获得更高巡航速度，是规划长航线时常用的折中速度。",
    keywordsZh: ["LRC", "最长航程巡航"],
    keywordsEn: ["LRC", "long range cruise"],
    tags: ["巡航", "航程"],
    regulationRefs: [],
    contentZh: "LRC 速度对应单位燃油航程接近最大但略有折衷的位置，一般比真正的最大航程速度略高，以换取更短的飞行时间。Airbus 手册中通常给出 LRC 对应的马赫数曲线，供飞行计划和巡航调整使用。",
    contentEn: "Long Range Cruise speed provides almost the maximum range with a slightly higher speed than the true maximum range speed, giving a good compromise between range and time.",
    formulas: [],
    figures: []
  },

  // =============================
  // C. TAKEOFF
  // =============================
  {
    id: "c-1-1-balanced-field-length",
    primaryType: "formula",
    titleZh: "平衡场长（Balanced Field Length）",
    titleEn: "Balanced Field Length",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh: "平衡场长是加速停飞距离等于加速继续起飞距离时的跑道长度，是确定限制起飞重量的关键概念。",
    keywordsZh: ["平衡场长", "Balanced Field", "加速停飞", "加速继续"],
    keywordsEn: ["balanced field length", "accelerate-stop", "accelerate-go"],
    tags: ["起飞", "限制"],
    regulationRefs: ["CS 25.109", "CS 25.113"],
    contentZh: "在给定重量、构型和环境条件下，通过选择合适的 V1，使得拒绝起飞距离（加速-停飞）与单发继续起飞距离（加速-起飞）相等，此时所需跑道长度称为平衡场长。起飞重量不能超过在给定 TORA/ASDA/TODA 内满足平衡场长要求的值。",
    contentEn: "Balanced field length is obtained when the accelerate-stop distance equals the accelerate-go distance for a given weight, configuration and environment.",
    formulas: [
      {
        id: "bfl-concept",
        latex: "ASD(V_1) = AGD(V_1)",
        explainZh: ["通过调节 V1 使加速-停飞距离与加速-继续起飞距离相等，即得到平衡场长。"]
      }
    ],
    figures: []
  },
  {
    id: "c-1-2-tora-toda-asda-lda",
    primaryType: "definition",
    titleZh: "跑道距离定义 TORA/TODA/ASDA/LDA",
    titleEn: "Runway Distances: TORA/TODA/ASDA/LDA",
    chapter: "C. TAKEOFF",
    section: "2. GROUND LIMITATIONS",
    summaryZh: "TORA、TODA、ASDA 和 LDA 分别代表可用起飞滑跑、起飞距离、加速停飞距离和着陆距离，是所有起飞/着陆性能计算的基础参数。",
    keywordsZh: ["TORA", "TODA", "ASDA", "LDA", "跑道距离"],
    keywordsEn: ["TORA", "TODA", "ASDA", "LDA"],
    tags: ["起飞", "着陆", "基础概念"],
    regulationRefs: [],
    contentZh: "TORA（TakeOff Run Available）为可用起飞滑跑距离；TODA（TakeOff Distance Available）在 TORA 基础上加上清除道长度；ASDA（Accelerate-Stop Distance Available）在 TORA 基础上加上停止道长度；LDA（Landing Distance Available）为可用着陆距离。性能图在计算起飞限制重量和着陆限制重量时，都会综合这些距离。",
    contentEn: "TORA is the takeoff run available, TODA is the takeoff distance available including clearway, ASDA is the accelerate-stop distance available including stopway, and LDA is the landing distance available.",
    formulas: [],
    figures: []
  },
  {
    id: "c-1-3-accelerate-stop-distance",
    primaryType: "definition",
    titleZh: "加速-停飞距离",
    titleEn: "Accelerate-Stop Distance",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh: "加速-停飞距离是从起飞开始加速到 V1，并在故障发生后完全刹停所需的总距离，是场长限制的一部分。",
    keywordsZh: ["加速停飞", "accelerate-stop"],
    keywordsEn: ["accelerate-stop distance"],
    tags: ["起飞"],
    regulationRefs: ["CS 25.109"],
    contentZh: "假定所有发动机运转至 V1，在 V1 时发生故障并立即拒绝起飞，飞机继续在跑道上滑行、施加最大刹车直至完全停止，从起飞开始到停住所经历的距离即加速-停飞距离。该距离必须小于或等于 ASDA。",
    contentEn: "The accelerate-stop distance is the distance required to accelerate with all engines operating to V1, experience an engine failure, and then bring the aeroplane to a complete stop.",
    formulas: [],
    figures: []
  },
  {
    id: "c-1-4-accelerate-go-distance",
    primaryType: "definition",
    titleZh: "加速-继续起飞距离",
    titleEn: "Accelerate-Go Distance",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh: "加速-继续起飞距离是在 V1 发生发动机故障但继续起飞时，飞机从起飞开始到达到规定越障高度所需的总距离。",
    keywordsZh: ["加速继续", "accelerate-go"],
    keywordsEn: ["accelerate-go distance"],
    tags: ["起飞"],
    regulationRefs: ["CS 25.111", "CS 25.113"],
    contentZh: "假定所有发动机运转至 V1，在 V1 时关键发动机失效，但机组选择继续起飞，则飞机在剩余发动机推力下继续滑跑、抬轮、离地并爬升至规定越障高度所需的距离称为加速-继续起飞距离。该距离不得超过 TODA。",
    contentEn: "The accelerate-go distance is the distance required to continue the takeoff after an engine failure at V1 and reach the specified screen height.",
    formulas: [],
    figures: []
  },
  {
    id: "c-1-5-clearway-stopway",
    primaryType: "definition",
    titleZh: "清除道与停止道",
    titleEn: "Clearway and Stopway",
    chapter: "C. TAKEOFF",
    section: "2. GROUND LIMITATIONS",
    summaryZh: "清除道用于增加 TODA，停止道用于拒绝起飞时提供额外制动距离，但两者都不能作为正常起飞滑跑使用。",
    keywordsZh: ["清除道", "停止道", "clearway", "stopway"],
    keywordsEn: ["clearway", "stopway"],
    tags: ["起飞"],
    regulationRefs: [],
    contentZh: "清除道位于跑道端外的矩形区域，要求无障碍物，可用于增加可用起飞距离 TODA，但飞机不得在清除道上滑跑。停止道为紧接跑道端后的强化路面区域，仅用于拒绝起飞时继续滑行制动，增加 ASDA，同样不允许作为起飞滑跑距离。",
    contentEn: "A clearway is an area beyond the runway end free of obstacles and used only in TODA calculations. A stopway is a paved area beyond the runway end available for decelerating the aeroplane in case of a rejected takeoff.",
    formulas: [],
    figures: []
  },
  {
    id: "c-1-6-obstacle-limited-tow",
    primaryType: "definition",
    titleZh: "障碍物限制起飞重量",
    titleEn: "Obstacle-Limited Takeoff Weight",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh: "在跑道延长线附近存在高障碍物时，单发爬升越障要求可能比场长先限制起飞重量。",
    keywordsZh: ["障碍物限制", "越障重量"],
    keywordsEn: ["obstacle limited weight"],
    tags: ["起飞", "限制"],
    regulationRefs: [],
    contentZh: "当跑道附近存在山丘、建筑或障碍物时，需要基于单发净爬升梯度计算起飞路径，确保在规定水平距离内达到足够净越障高度。根据障碍物高度和位置反推的最大允许起飞重量称为障碍物限制起飞重量。运营时应取场长限制重量与障碍物限制重量中的较小者。",
    contentEn: "Obstacle clearance requirements may limit the allowable takeoff weight before runway length does, especially in the presence of high obstacles close to the runway.",
    formulas: [],
    figures: []
  },

  // =============================
  // D. IN FLIGHT PERFORMANCE
  // =============================
  {
    id: "d-1-1-climb-gradient",
    primaryType: "definition",
    titleZh: "爬升梯度",
    titleEn: "Climb Gradient",
    chapter: "D. IN FLIGHT PERFORMANCE",
    section: "1. CLIMB",
    summaryZh: "爬升梯度以高度增加与水平距离之比表示，是衡量飞机越障和单发性能的关键指标。",
    keywordsZh: ["爬升梯度", "净梯度", "毛梯度"],
    keywordsEn: ["climb gradient", "gross", "net"],
    tags: ["爬升"],
    regulationRefs: [],
    contentZh: "爬升梯度通常以百分比或角度表示，等于垂直速度与地速之比。认证性能区分毛梯度（Gross）和净梯度（Net），后者在毛梯度基础上扣除规定裕度，用于障碍物分析和航线评估。",
    contentEn: "Climb gradient is the ratio of vertical speed to ground speed and is expressed in percent. Net gradients include regulatory margins applied to gross gradients.",
    formulas: [
      {
        id: "climb-gradient-formula",
        latex: "Gradient = \\frac{V_{z}}{V_{g}} \\approx \\tan \\gamma",
        explainZh: ["V_z：垂直速度", "V_g：地速", "\\gamma：爬升角"]
      }
    ],
    figures: []
  },
  {
    id: "d-2-1-specific-range",
    primaryType: "formula",
    titleZh: "比航程与最大航程速度",
    titleEn: "Specific Range and Maximum Range Speed",
    chapter: "D. IN FLIGHT PERFORMANCE",
    section: "2. CRUISE",
    summaryZh: "比航程定义为单位燃油可飞行的距离，最大航程速度对应比航程最大的点，是分析经济巡航与油量规划的基础。",
    keywordsZh: ["比航程", "最大航程"],
    keywordsEn: ["specific range", "maximum range"],
    tags: ["巡航", "航程", "燃油"],
    regulationRefs: [],
    contentZh: "比航程等于单位燃油消耗可飞行的距离，与升阻比、发动机比油耗和重量相关。最大航程速度对应比航程曲线的峰值，但实际运营常使用 LRC 或 ECON 速度，以在航程和时间之间取得折中。",
    contentEn: "Specific range is the distance flown per unit of fuel. The maximum range speed corresponds to the maximum specific range but is rarely used in day-to-day operations.",
    formulas: [
      {
        id: "specific-range",
        latex: "SR = \\frac{V}{\\dot{W}_{fuel}}",
        explainZh: ["SR：比航程", "V：真空速", "\\dot{W}_{fuel}：燃油消耗率"]
      }
    ],
    figures: []
  },
  {
    id: "d-2-2-optimum-altitude",
    primaryType: "definition",
    titleZh: "最佳巡航高度",
    titleEn: "Optimum Cruise Altitude",
    chapter: "D. IN FLIGHT PERFORMANCE",
    section: "2. CRUISE",
    summaryZh: "最佳巡航高度是在当前重量和风条件下，总燃油消耗最小的高度，随重量减轻而缓慢升高。",
    keywordsZh: ["最佳高度", "optimum level"],
    keywordsEn: ["optimum altitude"],
    tags: ["巡航", "燃油"],
    regulationRefs: [],
    contentZh: "随着飞机重量减轻，升阻比与发动机效率的最佳组合高度会变化。FMS 根据性能模型自动计算最佳高度，并给出步爬建议，通常显示为 OPT FL。",
    contentEn: "The optimum cruise altitude is the level at which the fuel flow for a given cruise speed is minimized for the current weight and wind. It increases as weight decreases.",
    formulas: [],
    figures: []
  },
  {
    id: "d-3-1-descent-profile",
    primaryType: "definition",
    titleZh: "下降剖面与能量管理",
    titleEn: "Descent Profile and Energy Management",
    chapter: "D. IN FLIGHT PERFORMANCE",
    section: "3. DESCENT / HOLDING",
    summaryZh: "理想下降剖面在满足约束高度和速度的前提下，以近似 idle 推力下降，兼顾燃油、噪音和乘客舒适度。",
    keywordsZh: ["下降剖面", "能量管理", "TOD"],
    keywordsEn: ["descent profile", "energy management"],
    tags: ["下降"],
    regulationRefs: [],
    contentZh: "现代 FMS 根据约束高度、速度和风，计算最优下降起点 TOD 和路径。良好的能量管理要求在下降初期尽早减推力并按指引速度配置，从而避免低效的“拖油门拉机头”或过度使用速度刹车。",
    contentEn: "An optimized descent profile is usually flown at idle thrust with speed or Mach control, respecting altitude and speed constraints while minimizing fuel burn.",
    formulas: [],
    figures: []
  },

  // =============================
  // E. IN FLIGHT PERFORMANCE WITH FAILURE
  // =============================
  {
    id: "e-1-1-oei-climb-segments",
    primaryType: "definition",
    titleZh: "单发起飞爬升各阶段",
    titleEn: "One-Engine-Inoperative (OEI) Climb Segments",
    chapter: "E. IN FLIGHT PERFORMANCE WITH FAILURE",
    section: "1. ENGINE FAILURE",
    summaryZh: "起飞发动机失效后，爬升按照 1～4 段划分，每段都有不同高度范围和法规要求的最小净爬升梯度。",
    keywordsZh: ["单发爬升", "一发失效", "爬升分段"],
    keywordsEn: ["OEI climb", "climb segments"],
    tags: ["起飞", "爬升", "限制"],
    regulationRefs: [],
    contentZh: "传统定义将单发起飞爬升分为：第一段（起飞至起落架收上）、第二段（起落架收上至加速高度）、第三段（加速并收襟）、第四段（清洁构型爬升）。各段要求不同的净爬升梯度，起飞重量必须满足所有分段的净梯度要求。",
    contentEn: "After an engine failure at takeoff, the OEI climb is divided into several segments with different configuration and gradient requirements. These segments drive the takeoff weight limitations.",
    formulas: [],
    figures: []
  },
  {
    id: "e-1-2-drift-down",
    primaryType: "definition",
    titleZh: "漂降程序（Drift-Down）",
    titleEn: "Drift-Down Procedure",
    chapter: "E. IN FLIGHT PERFORMANCE WITH FAILURE",
    section: "1. ENGINE FAILURE",
    summaryZh: "巡航中一发失效时，飞机可能无法维持当前高度，需要沿最佳漂降剖面下降到单发服务高度，同时满足地形/障碍物要求。",
    keywordsZh: ["漂降", "Drift-Down", "单发服务高度"],
    keywordsEn: ["drift-down"],
    tags: ["巡航", "限制"],
    regulationRefs: [],
    contentZh: "漂降性能图给出在不同重量下单发情况下的最佳漂降速度（通常接近 Green Dot）和对应的高度-距离关系。飞行计划阶段需检查沿航路在最不利点失效时，漂降剖面是否能满足地形净空要求。",
    contentEn: "Drift-down describes the descent from cruise altitude to a lower engine-out ceiling after an engine failure, using an optimum speed profile to clear terrain.",
    formulas: [],
    figures: []
  },

  // =============================
  // F. LANDING & G. FUEL
  // =============================
  {
    id: "f-1-1-landing-distance-dry-wet",
    primaryType: "definition",
    titleZh: "干跑道与湿跑道着陆距离",
    titleEn: "Landing Distance on Dry and Wet Runways",
    chapter: "F. LANDING",
    section: "2. LANDING LIMITATIONS",
    summaryZh: "干跑道着陆距离基于最大认证制动和规定的安全裕度计算，湿跑道或污染跑道则需要额外修正或使用专门的性能数据。",
    keywordsZh: ["着陆距离", "干跑道", "湿跑道"],
    keywordsEn: ["landing distance", "dry", "wet"],
    tags: ["着陆", "限制"],
    regulationRefs: [],
    contentZh: "AFM 给出的着陆距离通常为干跑道值，并在运营规则中乘以安全系数得到实际所需 LDA。湿跑道或污染跑道会显著增加制动距离，需要应用法规或制造商提供的修正因子。运行决策时，应同时考虑跑道长度、制动状态和反推使用。",
    contentEn: "Landing distances published in the AFM are usually for dry runways. Operational rules require safety factors and additional corrections for wet or contaminated conditions.",
    formulas: [],
    figures: []
  },
  {
    id: "g-1-1-reserve-fuel-concepts",
    primaryType: "definition",
    titleZh: "预备油与备降油概念",
    titleEn: "Reserve and Alternate Fuel Concepts",
    chapter: "G. FUEL PLANNING AND MANAGEMENT",
    section: "1. FUEL PLANNING",
    summaryZh: "燃油计划通常包括航程油、备降油、终端预备油、附加预备油以及等待/复飞油量等部分，满足 EASA/FAA 对剩余油量的最低要求。",
    keywordsZh: ["预备油", "备降油", "备用油"],
    keywordsEn: ["reserve fuel", "alternate fuel"],
    tags: ["燃油", "规划"],
    regulationRefs: [],
    contentZh: "根据 EASA/FAA 规定，燃油计划至少应包括：前往目的地的航程油、备降机场燃油（如需要）、在目的地或备降机场的终端预备油（例如 30 min holding）、以及根据运营要求增加的附加预备油等。Airbus 文档在燃油章节对各类油量的含义和典型取值给出了详细说明。",
    contentEn: "Fuel planning consists of trip fuel, alternate fuel when required, final reserve fuel and any additional fuel as per the applicable regulations and company policy.",
    formulas: [],
    figures: []
  },

  // =============================
  // C. TAKEOFF – FACTORS & METHODS
  // =============================
  {
    id: "c-4-1-factors-of-influence",
    primaryType: "definition",
    titleZh: "起飞性能影响因素总览",
    titleEn: "Factors of Influence on Takeoff Performance",
    chapter: "C. TAKEOFF",
    section: "4. FACTORS OF INFLUENCE",
    summaryZh: "起飞所需距离和限制起飞重量同时受重量、气压高度、温度、风、跑道坡度和跑道状况等多种因素叠加影响。",
    keywordsZh: ["起飞性能", "温度", "气压高度", "风", "坡度", "污染跑道"],
    keywordsEn: ["takeoff performance", "pressure altitude", "temperature", "wind", "slope", "contamination"],
    tags: ["起飞", "基础概念"],
    regulationRefs: [],
    contentZh: "Airbus 文档将影响起飞性能的主要因素归纳为：\n- 飞机重量：重量越大，需要的推力和起飞距离越长，且单发爬升梯度降低；\n- 气压高度与温度：气压高度高、温度高时空气密度降低，推力和升力均减小，导致起飞距离增加、限制重量降低；\n- 风：逆风缩短起飞距离并提高越障能力，顺风则相反；\n- 跑道坡度：上坡跑道增加加速距离，下坡跑道则有利；\n- 跑道状况：湿跑道或污染跑道会显著降低轮胎附着力，增加加速停飞距离。\n\n实际性能计算中，上述因素往往同时存在，需要在性能工具中综合考虑。",
    contentEn: "Takeoff performance is influenced by aircraft weight, pressure altitude, temperature, wind, runway slope and surface condition. High weight, high altitude, high temperature, tailwind, uphill slope and contaminated surfaces all tend to increase required takeoff distance and reduce limiting weight.",
    formulas: [],
    figures: []
  },
  {
    id: "c-4-2-density-altitude",
    primaryType: "definition",
    titleZh: "密度高度对起飞性能的影响",
    titleEn: "Effect of Density Altitude on Takeoff",
    chapter: "C. TAKEOFF",
    section: "4. FACTORS OF INFLUENCE",
    summaryZh: "高温高原条件下，密度高度升高使发动机推力和机翼升力同时下降，是限制起飞性能的典型工况。",
    keywordsZh: ["密度高度", "高温高原", "性能退化"],
    keywordsEn: ["density altitude", "hot and high"],
    tags: ["起飞", "爬升"],
    regulationRefs: [],
    contentZh: "密度高度是与某一空气密度对应的标准大气高度。气压高度升高或温度升高都会造成密度高度上升。对于涡扇/涡扇发动机来说，高密度高度会导致推力下降；同时空气密度降低使机翼在同一指示空速下产生的升力减少。结果是：\n- 起飞加速更慢、滑跑距离增加；\n- 单发爬升梯度降低；\n- 限制起飞重量下降。\n\n高温高原机场的性能限制通常由密度高度主导。",
    contentEn: "At high density altitude, both engine thrust and wing lift are reduced. This leads to longer takeoff distances and lower one engine inoperative climb gradients, reducing the allowable takeoff weight.",
    formulas: [],
    figures: []
  },
  {
    id: "c-6-1-wet-contaminated-takeoff",
    primaryType: "definition",
    titleZh: "湿跑道与污染跑道起飞性能",
    titleEn: "Takeoff on Wet and Contaminated Runways",
    chapter: "C. TAKEOFF",
    section: "6. TAKEOFF ON WET OR CONTAMINATED RUNWAYS",
    summaryZh: "湿跑道和污染跑道显著降低加速-停飞能力，并可能改变起飞限制由场长主导还是障碍物主导。",
    keywordsZh: ["湿跑道", "污染跑道", "摩擦系数"],
    keywordsEn: ["wet runway", "contaminated runway"],
    tags: ["起飞", "限制"],
    regulationRefs: [],
    contentZh: "湿跑道（wet）与污染跑道（contaminated，如积水/积雪/冰）会降低轮胎与地面的摩擦系数，使刹车效率下降、拒绝起飞距离增加。对某些工况，障碍物限制重量可能转而被加速-停飞距离限制。\n\nAirbus 文档会给出针对湿跑道和不同污染程度的修正方法或专门表格，运营政策通常禁止在严重污染跑道使用部分性能概念（例如减推力起飞）。",
    contentEn: "Wet and contaminated runways reduce friction and braking efficiency, increasing accelerate-stop distance. For some conditions, takeoff weight may become brake or runway length limited rather than obstacle limited.",
    formulas: [],
    figures: []
  },
  {
    id: "c-7-1-reduced-takeoff-thrust",
    primaryType: "definition",
    titleZh: "减推力起飞（FLEX/Derate）",
    titleEn: "Reduced Takeoff Thrust (FLEX/Derate)",
    chapter: "C. TAKEOFF",
    section: "7. REDUCED TAKEOFF THRUST",
    summaryZh: "通过假定较高“假想温度”或使用降额推力，减推力起飞可以显著降低发动机磨损，但必须满足性能和法规前提。",
    keywordsZh: ["减推力起飞", "FLEX", "Derate"],
    keywordsEn: ["reduced thrust", "FLEX", "derate"],
    tags: ["起飞", "发动机"],
    regulationRefs: [],
    contentZh: "减推力起飞的基本思想是在性能允许的前提下，以低于最大起飞推力的设置完成起飞，从而降低涡轮温度和结构负荷，延长发动机寿命。常见实现方式包括：\n- 假想温度法（FLEX）：向 FMS 输入高于实际的外界温度，发动机按“高温”情况给出较低推力；\n- 固定降额（Derate）：选择较低的起飞推力等级。\n\n使用减推力的前提是：起飞性能（场长、越障、单发爬升）在减推力情况下仍满足法规要求，且通常不允许在污染跑道、风切变概率高或特殊程序要求下使用。",
    contentEn: "Reduced takeoff thrust uses assumed temperature (FLEX) or fixed derate to lower takeoff thrust while still meeting all performance requirements. It reduces engine wear but is subject to limitations such as runway condition and obstacle clearance.",
    formulas: [],
    figures: []
  },
  {
    id: "c-9-1-return-to-land",
    primaryType: "definition",
    titleZh: "起飞后返场落地的性能考虑",
    titleEn: "Return to Land after Takeoff",
    chapter: "C. TAKEOFF",
    section: "9. RETURN TO LAND",
    summaryZh: "起飞后返场可能出现着陆重量超限、刹车能量超限或跑道距离不足等问题，需要综合考虑性能与程序。",
    keywordsZh: ["返场", "超重落地", "刹车能量"],
    keywordsEn: ["return to land", "overweight landing"],
    tags: ["起飞", "着陆", "限制"],
    regulationRefs: [],
    contentZh: "在起飞后不久返场（如发动机故障、客舱事件）时，着陆重量往往仍接近起飞重量，可能超过最大结构着陆重量 MLW，或在性能上接近跑道距离极限。此外，拒绝起飞或短时间内两次重刹车可能使刹车能量接近上限。Airbus 文档提供：\n- 超重落地的结构与性能考量；\n- 建议的燃油泄放或等待程序；\n- 刹车冷却时间与后续起飞的限制。",
    contentEn: "A return to land shortly after takeoff may lead to overweight landing and high brake energy. The crew must consider landing distance, structural limits and brake cooling, using the guidance provided in the performance documentation.",
    formulas: [],
    figures: []
  },

  // =============================
  // E. FAILURES – PRESSURIZATION & ETOPS
  // =============================
  {
    id: "e-2-1-pressurization-failure",
    primaryType: "definition",
    titleZh: "失压与紧急下降",
    titleEn: "Pressurization Failure and Emergency Descent",
    chapter: "E. IN FLIGHT PERFORMANCE WITH FAILURE",
    section: "2. PRESSURIZATION FAILURE",
    summaryZh: "客舱失压时，飞机必须在规定时间内下降到安全高度，同时兼顾结构速度限制、地形净空和乘客舒适度。",
    keywordsZh: ["失压", "紧急下降", "客舱高度"],
    keywordsEn: ["depressurization", "emergency descent"],
    tags: ["下降", "限制"],
    regulationRefs: [],
    contentZh: "失压情景下，程序通常要求：\n- 戴上氧气面罩并建立通信；\n- 迅速减推力、展开速度刹车，执行紧急下降；\n- 在结构速度和 Mach 限制范围内选择合适下降速度（如 MMO/VMO 附近）；\n- 在满足最低安全高度 MSA 或网格最低高度的前提下尽快下降到例如 10 000 ft 附近。\n\n性能文档会给出紧急下降梯度、所需水平距离和燃油消耗等信息，用于航路规划和 ETOPS 评估。",
    contentEn: "In case of a pressurization failure, an emergency descent is performed to a safe breathable altitude while respecting speed and structural limits and ensuring terrain clearance. Performance charts provide gradients and distances for planning.",
    formulas: [],
    figures: []
  },
  {
    id: "e-3-1-etops-basics",
    primaryType: "definition",
    titleZh: "ETOPS/双发延程飞行的性能概念",
    titleEn: "ETOPS Performance Basics",
    chapter: "E. IN FLIGHT PERFORMANCE WITH FAILURE",
    section: "3. ETOPS FLIGHT",
    summaryZh: "ETOPS（双发延程飞行）运行需要同时考虑发动机失效漂降剖面和失压紧急下降剖面，对备降机场和航路选择提出附加性能要求。",
    keywordsZh: ["ETOPS", "双发延程飞行", "备用场"],
    keywordsEn: ["ETOPS", "extended operations"],
    tags: ["巡航", "限制"],
    regulationRefs: [],
    contentZh: "在 ETOPS（双发延程飞行）中，飞机在任何时刻到最近适当备降机场的飞行时间不得超过批准的 ETOPS 时间。性能分析需要同时考虑：\n- 发动机失效情况下的漂降高度和巡航速度；\n- 失压情况下的紧急下降和低高度巡航；\n- 备降机场的跑道长度、气象和救援设施。\n\nAirbus 文档给出了用于 ETOPS（双发延程飞行）航路规划的速度、油量和时间参考。",
    contentEn: "ETOPS planning ensures that at any point along the route, the aircraft can reach an adequate alternate within the approved diversion time, considering both engine-out drift-down and depressurization profiles.",
    formulas: [],
    figures: []
  },
  {
    id: "e-4-1-route-study-performance",
    primaryType: "definition",
    titleZh: "航路性能研究（Route Study）",
    titleEn: "Route Study and Performance Evaluation",
    chapter: "E. IN FLIGHT PERFORMANCE WITH FAILURE",
    section: "4. GUIDANCE TO ROUTE STUDIES",
    summaryZh: "对于复杂地形或远洋航线，需要在计划阶段通过航路性能研究综合评估障碍物、ETOPS（双发延程飞行）和燃油等约束。",
    keywordsZh: ["航路研究", "Route Study", "性能评估"],
    keywordsEn: ["route study", "performance assessment"],
    tags: ["规划", "限制"],
    regulationRefs: [],
    contentZh: "航路性能研究通常包括：\n- 基于单发漂降和失压紧急下降，检查沿路地形和障碍物净空；\n- 在 ETOPS（双发延程飞行）场景下，评估各备降机场的可用性和时间圈；\n- 结合燃油计划，验证在最不利故障情况下仍有足够油量抵达备降场并保留预备油。\n\n这些分析结果通常以“性能航路图”或电子工具形式呈现，供飞行计划和安全评估使用。",
    contentEn: "Route studies combine obstacle clearance, ETOPS constraints and fuel planning to verify that a proposed route remains acceptable under worst-case failure scenarios.",
    formulas: [],
    figures: []
  },

  // =============================
  // F. LANDING – WEIGHT & GO-AROUND
  // =============================
  {
    id: "f-2-2-landing-limiting-weights",
    primaryType: "definition",
    titleZh: "着陆限制重量来源",
    titleEn: "Landing Limiting Weights",
    chapter: "F. LANDING",
    section: "2. LANDING LIMITATIONS",
    summaryZh: "着陆重量不仅受最大结构着陆重量 MLW 限制，还可能受场长、单发复飞梯度、刹车能量和轮胎速度等因素限制。",
    keywordsZh: ["着陆限制重量", "MLW", "场长限制"],
    keywordsEn: ["landing limiting weight", "MLW"],
    tags: ["着陆", "限制"],
    regulationRefs: [],
    contentZh: "对于给定机场和气象条件，着陆限制重量通常取以下各项中的最小值：\n- 最大结构着陆重量 MLW；\n- 场长限制重量（干/湿/污染跑道的着陆距离要求）；\n- 单发复飞梯度和进近爬升梯度限制；\n- 刹车能量和轮胎速度限制（高落地速度或高海拔机场）。\n\n飞行前性能计算会给出“着陆限制重量”，机组需确保预计落地重量不超过该值。",
    contentEn: "Landing weight may be limited by structural MLW, landing distance on dry/wet/contaminated runways, approach and go-around climb requirements, as well as brake energy and tire speed considerations.",
    formulas: [],
    figures: []
  },
  {
    id: "f-3-1-go-around-limitations",
    primaryType: "definition",
    titleZh: "复飞性能与限制",
    titleEn: "Go-Around Performance and Limitations",
    chapter: "F. LANDING",
    section: "3. GO-AROUND LIMITATIONS",
    summaryZh: "复飞阶段通常采用 TOGA 推力，但由于高襟翼、高阻配置，爬升性能相对较低，法规对复飞净爬升梯度有明确要求。",
    keywordsZh: ["复飞", "Go-Around", "复飞梯度"],
    keywordsEn: ["go-around", "missed approach"],
    tags: ["进近", "着陆", "爬升"],
    regulationRefs: [],
    contentZh: "在复飞中，飞机处于高升力、高阻配置，并携带一定襟翼与起落架阻力，因此相同推力下的爬升梯度低于起飞阶段。法规对双发、单发复飞的净爬升梯度提出最低要求。性能图会给出不同高度和温度下的复飞爬升能力，用于确定复飞程序的安全性和障碍物净空。",
    contentEn: "During a go-around, the aircraft is in a high-drag configuration and climb performance is reduced. Certification rules specify minimum net climb gradients for go-around and approach climb, which are checked against obstacle requirements.",
    formulas: [],
    figures: []
  },

  // =============================
  // APPENDICES – ISA, ALTIMETRY, SNOWTAM
  // =============================
  {
    id: "app-1-isa-basics",
    primaryType: "definition",
    titleZh: "国际标准大气 ISA 基础",
    titleEn: "International Standard Atmosphere (ISA) Basics",
    chapter: "APPENDIX 1 – ISA",
    section: "APPENDIX 1",
    summaryZh: "ISA 模型规定了随高度变化的标准温度、压力和密度，是所有性能图和高度换算的共同基准。",
    keywordsZh: ["ISA", "标准大气", "温度梯度"],
    keywordsEn: ["ISA", "standard atmosphere"],
    tags: ["基础概念"],
    regulationRefs: [],
    contentZh: "国际标准大气假定海平面温度为 15°C、气压为 1013.25 hPa，在对流层的平均温度递减率约为 6.5°C/1000 m。性能图中的“ISA+10” 等偏差均以此为基准。理解 ISA 及其偏差有助于判断温度对推力和升力的影响。",
    contentEn: "The ISA model defines standard pressure, temperature and density as a function of altitude (15°C and 1013.25 hPa at sea level with a lapse rate of about 6.5°C per km). Performance charts are referenced to ISA and ISA deviations.",
    formulas: [],
    figures: []
  },
  {
    id: "app-3-altimetry-concepts",
    primaryType: "definition",
    titleZh: "高度表设定与过渡高度/层",
    titleEn: "Altimetry Concepts and Transition Altitude/Level",
    chapter: "APPENDIX 3  ALTIMETRY",
    section: "APPENDIX 3",
    summaryZh: "QNH/QNE/QFE 设定和过渡高度/过渡层的概念，是理解高度限制和障碍物净空的基础。",
    keywordsZh: ["QNH", "QNE", "QFE", "过渡高度"],
    keywordsEn: ["QNH", "QNE", "transition altitude"],
    tags: ["基础概念"],
    regulationRefs: [],
    contentZh: "常见高度表设定包括：\n- QNH：以海平面大气压力校正，高度表显示海拔高度；\n- QNE：设定 1013 hPa，高度表显示飞行高度层 FL；\n- QFE：以机场标高大气压力校正，高度表在本场地面上读 0。\n\n过渡高度 TA 是由 QNH 转 FL 的高度，过渡层 TL 则是由 FL 转 QNH 的高度区间。性能图和障碍物分析通常以压力高度或飞行高度层为基准。",
    contentEn: "Altimetry uses QNH, QNE and QFE settings and defines a transition altitude and transition level to switch between altitude and flight level. Performance and obstacle data are usually referenced to pressure altitude.",
    formulas: [],
    figures: []
  },
  {
    id: "app-7-snowtam-use",
    primaryType: "definition",
    titleZh: "SNOWTAM 与跑道状况编码",
    titleEn: "Use of SNOWTAM and Runway Condition Codes",
    chapter: "APPENDIX 7 – USE OF SNOWTAM",
    section: "APPENDIX 7",
    summaryZh: "SNOWTAM 和跑道状况代码（RCC）提供污染跑道的类型与深度信息，是选择合适性能表和运行策略的依据。",
    keywordsZh: ["SNOWTAM", "RCC", "跑道状况代码"],
    keywordsEn: ["SNOWTAM", "runway condition code"],
    tags: ["跑道", "污染跑道"],
    regulationRefs: [],
    contentZh:
      "SNOWTAM 以标准格式报告跑道上的积雪、积水、冰等污染物的类型、深度和覆盖率，并给出跑道状况代码 RCC。性能文档中针对不同 RCC 或污染组合给出修正因子或专门图表。机组需要根据 SNOWTAM 选择正确的“湿/污染跑道”性能数据，并评估起飞和着陆可行性。",
    contentEn:
      "SNOWTAM messages and runway condition codes describe the type, depth and coverage of contamination. They are used to select the appropriate wet or contaminated runway performance data and to decide whether takeoff or landing is acceptable.",
    formulas: [],
    figures: []
  },
  {
    id: "app-5-1-lift-drag-equations",
    primaryType: "formula",
    titleZh: "标准升力和阻力方程",
    titleEn: "Standard Lift and Drag Equations",
    chapter: "APPENDIX 5 – FLIGHT MECHANICS",
    section: "1.1 / 1.2 LIFT AND DRAG",
    summaryZh:
      "在定常平飞中，升力等于重量、推力等于阻力。标准升力/阻力方程将速度、机翼面积和气动系数与升力、阻力联系起来，是所有性能推导的基础。",
    keywordsZh: ["升力", "阻力", "C_L", "C_D"],
    keywordsEn: ["lift", "drag", "CL", "CD"],
    tags: ["飞行力学", "基础公式"],
    regulationRefs: [],
    contentZh:
      "在稳态平飞时，可认为升力 L ≈ 重量 W，推力 T ≈ 阻力 D。升力和阻力都可以写成空气密度、机翼面积、真空速以及对应气动系数的函数，这一形式是失速速度、Green Dot 速度和各种爬升性能推导的出发点。",
    contentEn:
      "In steady level flight, lift balances weight and thrust balances drag. Lift and drag can be written as functions of air density, wing area, true airspeed and the corresponding aerodynamic coefficients.",
    formulas: [
      {
        id: "standard-lift",
        latex: "L = W = \\tfrac{1}{2} \\rho S V^2 C_L",
        explainZh: [
          "L：升力（定常平飞时等于重量 W）",
          "\\rho：空气密度",
          "S：机翼面积",
          "V：真空速 TAS",
          "C_L：升力系数，受迎角、马赫数和构型影响"
        ]
      },
      {
        id: "standard-drag",
        latex: "D = T = \\tfrac{1}{2} \\rho S V^2 C_D",
        explainZh: [
          "D：阻力（定常平飞时等于所需推力 T）",
          "C_D：阻力系数，体现诱导阻力和型阻等成分"
        ]
      }
    ],
    figures: []
  },
  {
    id: "app-5-2-climb-gradient-and-rc",
    primaryType: "formula",
    titleZh: "爬升/下降梯度与爬升率公式",
    titleEn: "Climb/Descent Gradient and Rate of Climb",
    chapter: "APPENDIX 5 – FLIGHT MECHANICS",
    section: "1.4 CLIMB AND DESCENT",
    summaryZh:
      "在小角度近似下，爬升/下降梯度可以表示为 (T−D)/W，与推重比和升阻比直接相关；爬升率 RC 则等于真空速乘以该梯度。",
    keywordsZh: ["爬升梯度", "下降梯度", "爬升率", "L/D"],
    keywordsEn: ["climb gradient", "descent gradient", "rate of climb", "L/D"],
    tags: ["飞行力学", "爬升", "下降"],
    regulationRefs: [],
    contentZh:
      "将爬升/下降角 \\gamma 看作小角度时，有 \\sin\\gamma \\approx \\tan\\gamma \\approx \\gamma_{rad}。结合受力平衡，可得到梯度与推力、阻力和升阻比的关系；再乘以真空速即可得到爬升率和下降率。",
    contentEn:
      "For small climb or descent angles, the gradient is approximately (Thrust−Drag)/Weight and depends on thrust-to-weight ratio and lift-to-drag ratio. Multiplying by TAS gives the rate of climb or descent.",
    formulas: [
      {
        id: "gamma-rad",
        latex: "\\gamma_{rad} = \\frac{T - D}{W}",
        explainZh: ["\\gamma_{rad}：以弧度计的爬升/下降角；T：推力；D：阻力；W：重量"]
      },
      {
        id: "gamma-ld",
        latex: "\\gamma_{rad} = \\frac{T}{W} - \\frac{1}{L/D}",
        explainZh: ["将 D/L 写成 1/(L/D)，可以看出爬升梯度由推重比和升阻比共同决定"]
      },
      {
        id: "gamma-percent",
        latex: "\\gamma(\\%) = 100 \\left( \\frac{T}{W} - \\frac{1}{L/D} \\right)",
        explainZh: ["以百分比形式表示的爬升/下降梯度，在性能表和法规中广泛使用"]
      },
      {
        id: "rc-formula",
        latex: "RC = V_{TAS} \\sin\\gamma \\approx V_{TAS} \\cdot \\frac{T - D}{W}",
        explainZh: [
          "RC：爬升率（垂直速度）",
          "V_{TAS}：真空速",
          "T−D 越大或 TAS 越大，在给定重量下 RC 越大"
        ]
      },
      {
        id: "rd-formula",
        latex: "RD = - V_{TAS} \\cdot \\frac{D}{W} = - \\frac{V_{TAS}}{L/D}",
        explainZh: [
          "RD：下降率（通常记为负值）",
          "在给定真空速下，升阻比 L/D 越大，下降率越小、下降越平缓"
        ]
      }
    ],
    figures: []
  },
  {
    id: "app-5-3-mach-form-equations",
    primaryType: "formula",
    titleZh: "按马赫数表示的升力/阻力方程",
    titleEn: "Lift and Drag as a Function of Mach Number",
    chapter: "APPENDIX 5 – FLIGHT MECHANICS",
    section: "1.3 EQUATIONS AS A FUNCTION OF MACH NUMBER",
    summaryZh:
      "在高空巡航时，可以把升力和阻力写成静压 P_s、机翼面积 S、马赫数 M 与气动系数的函数，说明在给定高度下升力和阻力近似与 M^2 成正比。",
    keywordsZh: ["马赫数", "升力", "阻力"],
    keywordsEn: ["Mach", "lift", "drag"],
    tags: ["飞行力学", "巡航"],
    regulationRefs: [],
    contentZh:
      "在标准大气假设下，可以将标准升力和阻力方程改写为静压 P_s 与马赫数 M 的形式，用于分析高空高速巡航性能。对给定高度和重量，升力和阻力都与 M^2 近似成正比。",
    contentEn:
      "Under standard atmosphere assumptions, the lift and drag equations may be written as functions of static pressure and Mach number, showing their approximate proportionality to M^2 at a given altitude.",
    formulas: [
      {
        id: "lift-mach-form",
        latex: "W = 0.7 \\; P_s \\; S \\; M^2 \\; C_L",
        explainZh: [
          "W：重量（定常平飞时等于升力）",
          "P_s：静压",
          "M：马赫数",
          "系数 0.7 为标准大气关系下的工程近似常数"
        ]
      },
      {
        id: "drag-mach-form",
        latex: "T = 0.7 \\; P_s \\; S \\; M^2 \\; C_D",
        explainZh: [
          "T：推力（定常平飞时等于阻力 D）",
          "C_D：阻力系数"
        ]
      }
    ],
    figures: []
  },
  {
    id: "app-5-4-aoa-lift-speed",
    primaryType: "formula",
    titleZh: "迎角、升力系数与速度关系",
    titleEn: "Angle of Attack, Lift Coefficient and Speed",
    chapter: "APPENDIX 5 – FLIGHT MECHANICS",
    section: "1.5 STALL AND LIFT CURVE",
    summaryZh:
      "在一定迎角范围内，升力系数 C_L 随迎角增加而单调上升；在重量和大气条件固定时，升力方程约束了 C_L 与真空速 TAS 的反向变化关系。",
    keywordsZh: ["迎角", "升力系数", "速度"],
    keywordsEn: ["angle of attack", "CL", "speed"],
    tags: ["飞行力学", "失速"],
    regulationRefs: [],
    contentZh:
      "在失速前的线性区间内，机翼升力系数 C_L 近似随迎角 \alpha 线性增加。由于在定常平飞中升力必须平衡重量，在空气密度和机翼面积给定的情况下，C_L 增加意味着真空速 TAS 必须降低，直至达到失速附近的最小速度。",
    contentEn:
      "Below stall, the lift coefficient increases approximately linearly with angle of attack. For a given weight, density and wing area, the lift equation then requires TAS to decrease as CL increases, down to the stall speed.",
    formulas: [
      {
        id: "cl-alpha",
        latex: "\\alpha \\uparrow \\Rightarrow C_L \\uparrow",
        explainZh: ["在失速前的线性区间内，升力系数随迎角增加而增加"]
      },
      {
        id: "weight-constant",
        latex: "W = \\tfrac{1}{2} \\rho S (TAS)^2 C_L = \\text{constant}",
        explainZh: [
          "在定常平飞中，重量 W 视为常数",
          "给定高度下空气密度 \\rho 和机翼面积 S 也近似为常数"
        ]
      },
      {
        id: "cl-tas-tradeoff",
        latex:
          "C_L \\uparrow \\Rightarrow TAS \\downarrow \\quad (W, \\rho, S \\; \\text{不变时})",
        explainZh: ["在重量和大气条件固定时，为保持升力=重量，C_L 增加必须由 TAS 减小来补偿"]
      }
    ],
    figures: []
  },
  {
    id: "a-2-2-weight-relationships",
    primaryType: "formula",
    titleZh: "起飞重量、着陆重量与无燃油重量关系",
    titleEn: "Relationships between TOW, LW and ZFW",
    chapter: "A. AIRCRAFT LIMITATIONS",
    section: "2. MAXIMUM STRUCTURAL WEIGHTS / DEFINITIONS",
    summaryZh:
      "干重 DOW、载荷、预备油和航程油的组合形成起飞重量 TOW、着陆重量 LW 和无燃油重量 ZFW，是性能和载荷平衡计算的基础。",
    keywordsZh: ["TOW", "LW", "ZFW", "重量"],
    keywordsEn: ["TOW", "LW", "ZFW", "weights"],
    tags: ["基础概念", "重量"],
    regulationRefs: [],
    contentZh:
      "Airbus 文档将各类典型重量之间的关系写成简单方程：TOW 由干重、载荷和全部燃油构成；着陆重量 LW 等于起飞重量减去航程油；无燃油重量 ZFW 则是不含任何燃油的总重量。这些关系是性能计算和载荷平衡检查的共用基础。",
    contentEn:
      "The documentation defines simple equations linking dry operating weight, traffic load, reserves, trip fuel, takeoff weight, landing weight and zero fuel weight.",
    formulas: [
      {
        id: "tow-definition",
        latex:
          "TOW = DOW + \\text{traffic load} + \\text{fuel reserves} + \\text{trip fuel}",
        explainZh: [
          "TOW：起飞重量",
          "DOW：干重（机组、餐食等固定项目）",
          "traffic load：旅客和货物",
          "fuel reserves：各类预备油",
          "trip fuel：航程油"
        ]
      },
      {
        id: "lw-definition",
        latex: "LW = DOW + \\text{traffic load} + \\text{fuel reserves}",
        explainZh: ["LW：着陆重量，等于 ZFW 加上预备油"]
      },
      {
        id: "zfw-definition",
        latex: "ZFW = DOW + \\text{traffic load}",
        explainZh: ["ZFW：无燃油重量，仅包含机体和载荷，不含任何燃油"]
      },
      {
        id: "actual-lw-mlw",
        latex:
          "\\text{Actual } LW = TOW - \\text{Trip Fuel} \\leq MLW",
        explainZh: [
          "实际着陆重量等于起飞重量减去航程油",
          "必须不超过最大结构着陆重量 MLW"
        ]
      },
      {
        id: "actual-tow-mlw",
        latex:
          "\\text{Actual } TOW \\leq MLW + \\text{Trip Fuel}",
        explainZh: [
          "从上一式变形得到的等价条件",
          "起飞重量上限等于 MLW 加上预计航程油量"
        ]
      }
    ],
    figures: []
  },
  {
    id: "b-1-4-key-speed-relationships",
    primaryType: "formula",
    titleZh: "关键速度之间的典型关系",
    titleEn: "Key Speed Relationships",
    chapter: "B. OPERATING SPEEDS",
    section: "1–3 SPEED RELATIONSHIPS",
    summaryZh:
      "性能和法规把起飞、进近和着陆中的关键速度通过倍数关系串联起来，用于保证操纵性和失速裕度。",
    keywordsZh: ["V1", "V2", "VMCG", "VMCA", "VLS", "VAPP", "VREF"],
    keywordsEn: ["V1", "V2", "VMCG", "VMCA", "VLS", "VAPP", "VREF"],
    tags: ["起飞", "进近", "着陆", "限制"],
    regulationRefs: [],
    contentZh:
      "起飞阶段，必须满足 VMCG ≤ VEF < V1 ≤ VMBE 等排序关系，同时 VR 和 V2 要明显高于空中最小操纵速度 VMCA；进近和着陆阶段，VLS 与 1g 失速速度 VS1g 有固定倍数关系，VAPP 至少不低于 VLS，并在其基础上加风修正，VREF 在正常情况下等于着陆构型下的 VLS。",
    contentEn:
      "Certification links key speeds in takeoff and landing through inequalities and multipliers to ensure controllability and stall margins.",
    formulas: [
      {
        id: "vmcg-vef-v1-vmbe",
        latex: "V_{MCG} \\leq V_{EF} < V_1 \\leq V_{MBE}",
        explainZh: ["拒绝起飞工况下，地面操纵、故障识别和刹车能量限制之间的排序关系"]
      },
      {
        id: "vr-vmca",
        latex: "V_R \\geq 1.05 V_{MCA}",
        explainZh: ["抬轮速度必须至少为 VMCA 的 1.05 倍，以保证空中方向操纵裕度"]
      },
      {
        id: "v2-vmca",
        latex: "V_2 \\geq 1.1 V_{MCA}",
        explainZh: ["起飞安全速度 V2 至少为 VMCA 的 1.1 倍"]
      },
      {
        id: "vls-vs1g",
        latex: "V_{LS} \\geq 1.23 V_{S1g}",
        explainZh: ["多数 Airbus 机型中，最低可选速度 VLS 至少为 1.23 倍 1g 失速速度"]
      },
      {
        id: "vapp-min",
        latex: "V_{APP} \\geq V_{LS}",
        explainZh: ["进近速度不得低于 VLS，以保持失速裕度"]
      },
      {
        id: "vapp-definition",
        latex: "V_{APP} = V_{LS} + \\text{Wind correction}",
        explainZh: ["Wind correction 一般在 5–15 kt 范围内，根据逆风和顺风情况选取"]
      },
      {
        id: "vref-definition",
        latex: "V_{REF} = V_{LS} \\text{ in CONF FULL}",
        explainZh: ["正常情况下，着陆基准速度 VREF 等于全襟翼构型下的 VLS"]
      }
    ],
    figures: []
  },
  {
    id: "c-3-2-tod-dry-wet",
    primaryType: "formula",
    titleZh: "干跑道/湿跑道起飞距离 TOD_dry / TOD_wet",
    titleEn: "Takeoff Distance on Dry and Wet Runways",
    chapter: "C. TAKEOFF",
    section: "3. PERFORMANCE LIMITATIONS",
    summaryZh:
      "认证中，干跑道起飞距离 TOD_dry 取单发和全发两种距离中的较大值（全发再乘以 1.15 安全系数）；湿跑道起飞距离 TOD_wet 再在 TOD_dry 与单发湿跑道距离之间取较大值，并要求 TOD 不得超过 TODA。",
    keywordsZh: ["起飞距离", "TOD_dry", "TOD_wet", "TODA"],
    keywordsEn: ["takeoff distance", "TOD_dry", "TOD_wet", "TODA"],
    tags: ["起飞", "限制"],
    regulationRefs: [],
    contentZh:
      "Airbus 文档中给出的起飞距离定义如下：在干跑道时，全发起飞距离 TOD_{N,dry} 要乘以 1.15 的法规系数，并与单发起飞距离 TOD_{N−1,dry} 取最大值，得到干跑道起飞距离 TOD_dry；在湿跑道时，再在 TOD_dry 与单发湿跑道距离 TOD_{N−1,wet} 之间取最大值，得到 TOD_wet。最终无论干湿，起飞距离 TOD 都必须小于或等于可用起飞距离 TODA。",
    contentEn:
      "The certified takeoff distance on a dry runway is the maximum of the OEI distance and 1.15 times the all-engines-operating distance. On a wet runway, the takeoff distance is the maximum of TOD_dry and the OEI distance on wet. In all cases, the takeoff distance must not exceed TODA.",
    formulas: [
      {
        id: "tod-dry-formula",
        latex:
          "TOD_{dry} = \\max \\left\\{ TOD_{N-1,dry}, \\; 1.15 \\cdot TOD_{N,dry} \\right\\}",
        explainZh: [
          "TOD_{N-1,dry}：单发干跑道起飞距离",
          "TOD_{N,dry}：全发干跑道起飞距离",
          "1.15：针对全发距离的法规安全系数（相当于取 115% 距离）"
        ]
      },
      {
        id: "tod-wet-formula",
        latex:
          "TOD_{wet} = \\max \\left\\{ TOD_{dry}, \\; TOD_{N-1,wet} \\right\\}",
        explainZh: [
          "TOD_{N-1,wet}：单发湿跑道起飞距离（发动机在 V_EF 失效并在 V_1 识别）",
          "TOD_{wet}：湿跑道起飞距离，至少不小于干跑道 TOD_dry"
        ]
      },
      {
        id: "tod-toda-limit",
        latex: "TOD \\leq TODA",
        explainZh: [
          "TOD：选定工况下的起飞距离（干或湿）",
          "TODA：可用起飞距离（TORA 加清除道，清除道长度最多为 TORA 的一半）",
          "起飞限制重量必须保证 TOD 不超过 TODA"
        ]
      }
    ],
    figures: []
  },
  {
    id: "b-1-5-stall-speed-relationships",
    primaryType: "formula",
    titleZh: "失速速度 V_S / V_SR / V_S1g 关系",
    titleEn: "Stall Speed Relationships: VS, VSR and VS1g",
    chapter: "B. OPERATING SPEEDS",
    section: "1. COMMON SPEEDS",
    summaryZh:
      "失速章节区分了 VS、VSR 和 VS1g 三个速度：VS1g 对应最大升力系数且载荷因数为 1，VSR 为参考失速速度，并通过公式与 VCLMAX、VS1g 以及 V2 等速度建立关系。",
    keywordsZh: ["失速速度", "VS", "VSR", "VS1g"],
    keywordsEn: ["stall speed", "VS", "VSR", "VS1g"],
    tags: ["基础概念", "限制"],
    regulationRefs: [],
    contentZh:
      "文档中给出了参考失速速度 VSR 的正式定义，以及 VS1g 与 VS 的物理含义：VS1g 对应最大升力系数且载荷因数仍为 1；VS 对应传统气动失速，升力开始明显衰减、载荷因数低于 1。JAR/FAR 的更新将参考失速速度 VSR 与 1g 失速速度 VS1g 统一起来，并在此基础上给出了 V2min、VLS 等限制速度的倍数关系。",
    contentEn:
      "The documentation distinguishes between VS, VSR and VS1g. VS1g corresponds to maximum lift coefficient at 1g, VS to the conventional aerodynamic stall and VSR to the reference stall speed used for certification. Regulatory changes aligned VSR with VS1g and defined V2min and VLS as multiples of these speeds.",
    formulas: [
      {
        id: "vsr-definition",
        latex: "V_{SR} \\geq \\frac{V_{CLMAX}}{\\sqrt{n_{zw}}}",
        explainZh: [
          "V_{SR}：参考失速速度",
          "V_{CLMAX}：对应最大升力系数的速度（即 VS1g）",
          "n_{zw}：在 V_{CLMAX} 处沿飞行轨迹法向的载荷因数"
        ]
      },
      {
        id: "vsr-vs1g-equivalence",
        latex: "V_{SR} = V_{S1g} \\text{(基于 1g 失速速度的认证机型)}",
        explainZh: [
          "JAR 25 变更后，多数 Airbus 机型以 1g 失速速度 VS1g 作为参考失速速度 VSR",
          "因此在性能与限制计算中可近似视为二者相同"
        ]
      },
      {
        id: "vs-vs1g-example",
        latex: "V_S = 0.94 V_{S1g} \\text{(以 A320 试飞为例)}",
        explainZh: [
          "VS：传统定义下的气动失速速度",
          "V_{S1g}：在载荷因数仍等于 1 时，对应最大升力系数的失速速度",
          "对 A320，试飞给出了 VS 与 VS1g 的典型比例 0.94"
        ]
      },
      {
        id: "v2min-jet-vsr",
        latex: "V_{2min} \\geq 1.13 V_{SR} \\text{(jet)}",
        explainZh: [
          "CS/FAR25 规定，涡喷/涡扇飞机的最小起飞安全速度 V2min 至少为 1.13 倍参考失速速度 VSR"
        ]
      },
      {
        id: "v2min-airbus-vs1g",
        latex: "V_2 \\geq 1.13 V_{S1g} \\text{(Airbus 机型，按 VS1g 认证)}",
        explainZh: [
          "对按 VS1g 认证的大多数 Airbus 机型，起飞安全速度 V2 以 1.13 倍 VS1g 为下限"
        ]
      },
      {
        id: "v2min-airbus-vs",
        latex: "V_2 \\geq 1.2 V_S \\text{(A300/A310)}",
        explainZh: [
          "对早期按 VS 认证的 A300/A310，V2 不得低于 1.2 倍 VS"
        ]
      },
      {
        id: "vls-vs1g-stall",
        latex: "V_{LS} \\geq 1.23 V_{S1g}",
        explainZh: [
          "V_{LS}：最低可选速度",
          "在大部分 Airbus 机型中，V_{LS} 至少为 1.23 倍 1g 失速速度 VS1g",
          "该关系同时适用于进近和着陆阶段"
        ]
      },
      {
        id: "vls-vs-a300",
        latex: "V_{LS} = 1.3 V_S \\text{ (A300/A310)}",
        explainZh: [
          "对 A300/A310，VLS 以 VS 为基准，等于 1.3 倍 VS",
          "配合前述 V_2 ≥ 1.2 V_S 一起，构成早期机型的失速与限制速度体系"
        ]
      }
    ],
    figures: []
  }
];

module.exports = aircraftPerformanceEntries;

