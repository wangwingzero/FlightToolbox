/**
 * =================================================================
 *               Aircraft Limitations Definitions
 * =================================================================
 *
 * Sourced and optimized from the Airbus document:
 * "Getting to Grips with Aircraft Performance", December 2024.
 *
 * This file contains structured data for key aircraft limitation concepts.
 */

const aircraftLimitations = [
    {
      "nameEn": "Load Factor (nz)",
      "nameZh": "载荷因数 (nz)",
      "definition": `飞机被设计用于抵抗主要来自发动机、风切变和机动情况下的多种飞行载荷。载荷因数(nz)代表了作用于飞机（垂直于假定的飞机纵轴）的空气动力分量与飞机重量之比。正载荷因数指空气动力相对于飞机向上作用。当升力不等于重力时（例如在转弯、改出、颠簸中），飞机的表观重量(Wa)会不同于其实际重量。结构被设计为能抵抗规章定义的载荷因数。`,
      "relatedFormulas": [
        "nz = 升力 / 重量 (Lift / Weight)",
        "Wa (表观重量) = nz * m * g = 升力 (Lift)"
      ],
      "regulatoryRequirement": `CS/FAR 25.321(a): “飞行载荷因数代表了作用于飞机（垂直于假定的飞机纵轴）的空气动力分量与飞机重量之比。正载荷因数是指空气动力相对于飞机向上作用的一种。”\nCS/FAR 25.1531: “必须建立载荷因数限制，其不得超过由第25.333(b)节的机动图确定的正限制载荷因数。”`
    },
    {
      "nameEn": "VMO / MMO (Maximum Operating Speed / Mach)",
      "nameZh": "最大使用速度 / 马赫数",
      "definition": "VMO或MMO是在任何飞行阶段（爬升、巡航或下降）中不得有意超出的速度。它由一个红色和黑色的条带在PFD速度带上标示。",
      "relatedFormulas": [
        "A320-200 示例: VMO = 350 kt (IAS), MMO = M0.82"
      ],
      "regulatoryRequirement": `CS/FAR 25.1505: “VMO或MMO是在任何飞行阶段（爬升、巡航或下降）中不得有意超出的速度。”`
    },
    {
      "nameEn": "VFE (Maximum Flap Extended Speed)",
      "nameZh": "最大襟翼放出速度",
      "definition": "VFE是对应特定襟翼/缝翼构型下，飞机可以飞行的最大速度。必须设立VFE，以使其不超过设计的襟翼速度。",
      "relatedFormulas": [
        "A320-200 示例:",
        "CONF1: 230 kt",
        "CONF1+F: 215 kt",
        "CONF2: 200 kt",
        "CONF3: 185 kt",
        "CONFULL: 177 kt"
      ],
      "regulatoryRequirement": `CS/FAR 25.1511: “必须设立VFE，以使其不超过设计的襟翼速度。”`
    },
    {
      "nameEn": "VLO / VLE (Maximum Landing Gear Operating / Extended Speed)",
      "nameZh": "最大起落架操作 / 放下速度",
      "definition": `VLO (起落架操作速度)：不得超过安全伸出(EXT)和收回(RET)起落架的速度。如果伸出和收回速度不同，必须分别确定为VLO(EXT)和VLO(RET)。\nVLE (起落架放下速度)：不得超过在起落架完全锁定在放下位置时安全飞行的速度。`,
      "relatedFormulas": [
        "A320-200 示例:",
        "VLO RET: 220 kt (IAS)",
        "VLO EXT: 250 kt (IAS)",
        "VLE: 280 kt / M 0.67"
      ],
      "regulatoryRequirement": `CS/FAR 25.1515: VLO：“不得超过安全伸出和收回起落架的速度。如果伸出速度与收回速度不同，则必须分别确定为VLO(EXT)和VLO(RET)。” VLE：“不得超过在起落架完全锁定在放下位置时安全飞行的速度。”`
    },
    {
      "nameEn": "VMBE (Maximum Brake Energy Speed)",
      "nameZh": "最大刹车能量速度",
      "definition": "当起飞被中断时，刹车和空气动力阻力必须吸收并消除飞机的动能。刹车具有最大的能量吸收能力，即最大刹车能量。因此，对于特定的起飞重量，能够实现完全停止的决断速度(V1)被限制在一个最大值，这个速度关联的能量限制即为VMBE。",
      "relatedFormulas": [
        "动能 (Kinetic Energy) = ½ * 重量 (Weight) * V1²"
      ],
      "regulatoryRequirement": `CS 25.109(i) / FAR 25.109(i): “最大刹车动能加速-停止距离的飞行测试演示，必须在每个机轮刹车剩余不超过10%的可用磨损范围内进行。”`
    },
    {
      "nameEn": "VMCG (Minimum Control Speed on the Ground)",
      "nameZh": "地面最小操纵速度",
      "definition": `在起飞滑跑期间，当临界发动机突然失效时，仅使用主要气动操纵（不使用前轮转弯），并以正常驾驶技巧能够保持对飞机控制，从而安全继续起飞的校准空速。在确定VMCG时，飞机从偏离点到恢复与跑道中线平行的方向，其横向偏离在任何点都不得超过30英尺（约9.1米）。`,
      "relatedFormulas": null,
      "regulatoryRequirement": `CS/FAR 25.149(e): “VMCG，地面最小操纵速度，是在起飞滑跑过程中的校准空速，在此速度下，当临界发动机突然失效时，仅使用主要气动操纵（不使用前轮转弯）并以正常驾驶技巧，能够保持对飞机的控制，从而安全地继续起飞。在确定VMCG时，……其路径……在任何点都不得横向偏离中心线超过30英尺。”`
    },
    {
      "nameEn": "VMCA (Minimum Control Speed in the Air)",
      "nameZh": "空中最小操纵速度",
      "definition": `当临界发动机突然失效时，用该失效发动机保持不工作状态，能够保持对飞机的控制，并以不超过5度的坡度角保持直线飞行的校准空速。`,
      "relatedFormulas": [
        "VMCA 不得超过 1.13 VSR"
      ],
      "regulatoryRequirement": `CS/FAR 25.149(b): “VMC[A]是在临界发动机突然失效时，能够用该失效发动机保持不工作状态，并以不超过5度的坡度角保持对飞机控制和维持直线飞行的校准空速。”`
    },
    {
      "nameEn": "VMU (Minimum Unstick Speed)",
      "nameZh": "最小离地速度",
      "definition": `飞机能够安全地从地面抬升并继续起飞的校准空速。它是以下两个速度中的较大者：\n1. 以最大俯仰角（几何限制或气动限制）抬轮离地的速度（VLOF）。\n2. 确保能安全飞离地面效应的最小速度。`,
      "relatedFormulas": [
        "VMU(N-1) 通常大于 VMU(N)，因为单发推力较小，需要更高速度产生足够升力。"
      ],
      "regulatoryRequirement": `CS/FAR 25.107(d): “VMU是飞机能够安全地从地面抬升并继续起飞的校准空速…”`
    },
    {
      "nameEn": "VSR (Reference Stall Speed)",
      "nameZh": "参考失速速度",
      "definition": `由申请人定义的校准空速，作为确定其他性能速度的基础。VSR不得小于1g失速速度(VS1g)，即在载荷因数等于1时刚好达到最大升力系数的速度。它是基于最不利的重心位置（通常是前重心）和发动机慢车状态确定的。`,
      "relatedFormulas": [
        "VSR ≥ VCLMAX / √nzw",
        "A320认证示例: VS = 0.94 VS1g"
      ],
      "regulatoryRequirement": `CS 25.103(a): “参考失速速度VSR是由申请人定义的校准空速。VSR不得小于1g失速速度。”`
    },
    {
      "nameEn": "MTOW (Maximum Takeoff Weight)",
      "nameZh": "最大起飞重量",
      "definition": `飞机起飞时允许的最大重量。MTOW的确定基于多种限制条件，包括在假定垂直速度为-1.83米/秒（-360英尺/分钟）的失事着陆情况下的结构强度、飞行中的结构抗力标准以及起落架的强度标准。`,
      "relatedFormulas": null,
      "regulatoryRequirement": "CS/FAR 25.25: 必须为飞机设立重量限制。"
    },
    {
      "nameEn": "MLW (Maximum Landing Weight)",
      "nameZh": "最大着陆重量",
      "definition": `飞机着陆时允许的最大重量。MLW的限制是基于着陆冲击（假定垂直速度为-3.05米/秒或-600英尺/分钟）来确定的。`,
      "relatedFormulas": null,
      "regulatoryRequirement": "CS/FAR 25.25: 必须为飞机设立重量限制。"
    },
    {
      "nameEn": "MZFW (Maximum Zero Fuel Weight)",
      "nameZh": "最大零燃油重量",
      "definition": `为限制机翼根部弯矩而设定的、不含可用燃油时的飞机最大重量。当机翼油箱中燃油最少而机身载荷最大时，机翼承受的向上弯曲力矩最大。机翼中的燃油重量可以抵消一部分升力产生的弯矩，这种效应被称为“机翼弯曲应力释放”(Wing Bending Relief)。`,
      "relatedFormulas": null,
      "regulatoryRequirement": "CS/FAR 25.25: 必须为飞机设立重量限制。"
    },
    {
      "nameEn": "VLS (Lowest Selectable Speed)",
      "nameZh": "最低可选速度",
      "definition": "通常情况下，在飞行阶段中，飞行员不应选择低于VLS的速度，以保证足够的失速裕度。VLS的定义取决于飞行阶段和构型，在光洁和着陆构型下，它至少是1.23 VS1g。",
      "relatedFormulas": [
        "VLS ≥ 1.23 VS1g (对于按VSR认证的飞机)",
        "VLS = 1.3 VS (对于A300/A310)"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Green Dot Speed (GDS)",
      "nameZh": "绿点速度",
      "definition": "绿点速度是一个很好的折中速度，能使飞行员以接近光洁构型下最佳升阻比的速度飞行。它被用于单发失效后的飘降（Drift Down）以获得最高升限，也被用作最后起飞段（Final Takeoff Segment）末的目标速度，因为它能在低速下提供最佳爬升梯度。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "VAPP (Final Approach Speed)",
      "nameZh": "最后进近速度",
      "definition": "飞机在着陆过程中，到达跑道入口上方50英尺高度时的目标速度。此时襟缝翼处于着陆构型，起落架已放下。VAPP受VLS限制，并包含风修正。",
      "relatedFormulas": [
        "VAPP ≥ VLS",
        "VAPP = VLS + 风修正 (Wind correction)",
        "VAPP_TARGET = GS mini + 当前逆风 (current headwind)",
        "GS mini = VAPP - 塔台风 (tower wind)"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "VREF (Reference Speed)",
      "nameZh": "参考速度",
      "definition": "在发生飞行故障、紧急或非正常构型时，性能计算基于一个参考构型和一个参考速度VREF。VREF指在特定着陆构型下，飞机在50英尺高度点稳定进近的速度。对于空客飞机，该参考构型是CONF FULL。在系统失效影响着陆性能时，VREF会加上一个增量ΔVINOP。",
      "relatedFormulas": [
        "VREF = VLS (in CONF FULL)",
        "VAPP = VREF + ΔVINOP (在故障情况下)"
      ],
      "regulatoryRequirement": null
    }
];

module.exports = {
  aircraftLimitations
};