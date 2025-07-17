/**
 * =================================================================
 *               In-Flight Performance Definitions
 * =================================================================
 *
 * Sourced and optimized from the Airbus document:
 * "Getting to Grips with Aircraft Performance", December 2024.
 *
 * This file contains structured data for key in-flight performance concepts,
 * covering both normal and non-normal (failure) conditions.
 */

const inFlightPerformance = [
    {
      "nameEn": "Climb",
      "nameZh": "爬升",
      "definition": "飞机通过发动机提供的多余推力（推力大于阻力）将动能转化为势能的过程。爬升性能主要由爬升梯度（Climb Gradient）和爬升率（Rate of Climb, RC）来衡量。管理爬升过程涉及在速度和高度增益之间进行能量分配。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Climb Ceiling",
      "nameZh": "爬升升限",
      "definition": "飞机可以继续爬升直至爬升率接近于零的高度。然而，由于到达零爬升率需要消耗大量时间和燃油，FMGS（飞行管理和引导系统）通常会显示一个最大建议高度，该高度通常对应于300英尺/分钟的爬升率。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Climb at Minimum Cost (ECON Climb)",
      "nameZh": "最低成本爬升 (经济爬升)",
      "definition": "基于成本指数（Cost Index, CI）来优化直接运营成本的爬升策略。FMGS会计算出最佳的爬升速度（IASECON）和马赫数（MachECON）以优化爬升剖面。低CI值倾向于最小化燃油消耗（对应最大爬升率速度），高CI值则倾向于最小化飞行时间（对应更快的爬升速度）。",
      "relatedFormulas": [
        "CI = 0 ⇒ IASECON = 最大爬升率速度",
        "CI = CImax ⇒ IASECON = VMO - 10 kt"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Cruise",
      "nameZh": "巡航",
      "definition": "巡航阶段的目标是在燃油、时间或总成本方面优化速度和高度。在此阶段，飞机的升力平衡重力，推力平衡阻力，以维持稳定的平飞状态。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Specific Range (SR)",
      "nameZh": "单位航程",
      "definition": "单位燃油消耗所能飞行的距离，是衡量飞机燃油效率的关键指标。单位航程取决于飞机的气动特性（升阻比）、发动机性能（单位燃油消耗率SFC）、飞机重量和外界大气条件。其最大值对应的速度被称为最大航程速度。",
      "relatedFormulas": [
        "SR = 1 / 距离消耗 (Cd)",
        "SR = (a₀ * M * (L/D)) / (SFC * m * g * √(T/T₀))"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Maximum Range Mach Number (MMR)",
      "nameZh": "最大航程马赫数",
      "definition": "在给定重量和高度下，能使单位航程（SR）达到最大的马赫数。以MMR飞行可以实现给定燃油量的最大飞行距离，或给定距离的最小燃油消耗。随着飞行中燃油的消耗，飞机重量减小，MMR也会随之减小。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Long Range Cruise Mach Number (MLRC)",
      "nameZh": "远程巡航马赫数",
      "definition": "一种比最大航程马赫数（MMR）略快的巡航速度。它以牺牲极少量（通常是1%）的单位航程为代价，来换取巡航速度的显著提升。这是一种在燃油效率和飞行时间之间取得平衡的策略。",
      "relatedFormulas": [
        "SR_long range > 0.99 * SR_max range"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Economic Mach Number (MECON)",
      "nameZh": "经济马赫数",
      "definition": "使直接运营成本（Direct Operating Cost, DOC）最小化的巡航马赫数。DOC综合考虑了与飞行时间相关的成本和与燃油消耗相关的成本。MECON的值取决于成本指数（CI）。",
      "relatedFormulas": [
        "DOC = CC + CF * ΔF + CT * ΔT"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Optimum Cruise Altitude",
      "nameZh": "最佳巡航高度",
      "definition": "在固定速度策略下，使单位航程（SR）达到最大的巡航高度。当飞机在此高度飞行时，其升阻比达到所选马赫数下的最大值。随着飞机重量的减小，最佳巡航高度会逐渐升高。",
      "relatedFormulas": [
        "重量 (Weight) / 静压 (Ps) = 常数 (constant)"
      ],
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Buffet Limit / Buffet Ceiling",
      "nameZh": "抖振边界 / 抖振升限",
      "definition": "飞机运行中不发生抖振的速度和高度范围。抖振是由机翼上表面气流分离引起的振动。在给定高度，存在低速抖振边界和高速抖振边界。抖振升限是指为保持一定的机动裕度（如1.3g载荷因数）所能达到的最高高度。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Step Climb",
      "nameZh": "阶梯爬升",
      "definition": "一种巡航优化策略，用于在空中交通管制（ATC）要求的固定高度层限制下，尽可能地接近随重量减小而不断升高的最佳巡航高度。飞机以一系列恒定高度的航段飞行，并在适当时候爬升到下一个更高的飞行高度层。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Descent",
      "nameZh": "下降",
      "definition": "飞机从巡航高度下降到进近起始点的飞行阶段。通常在发动机慢车推力下进行，通过将势能转化为动能来维持速度。下降管理的目标是精确地到达特定位置和高度，为进近做准备。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Continuous Descent Approach (CDA)",
      "nameZh": "连续下降进近",
      "definition": "一种现代化的下降程序，飞机从下降顶点（Top of Descent）开始，以近乎恒定的角度、在发动机慢车推力下连续下降，直到最终进近点。这种方法可以减少燃油消耗、噪音和飞行员工作负荷。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Holding",
      "nameZh": "等待",
      "definition": "当飞机因交通流量、天气等原因无法立即进近着陆时，在指定空域内按照预定航线（通常是“跑马场”形）飞行的程序。等待管理的目标是在尽可能长的时间内（最大续航时间）或以最低的燃油流量消耗燃油。在光洁构型下，标准的等待速度基于绿点速度。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Net Drift Down Flight Path",
      "nameZh": "净飘降航迹",
      "definition": `在发动机失效后，飞机从巡航高度下降到新的稳定高度的过程中的净飞行轨迹。它是实际的“总飘降航迹”（Gross Drift Down Flight Path）减去一个规章要求的梯度罚值。对于单发失效，双发飞机的罚值为1.1%，四发飞机为1.6%。对于双发失效（四发飞机），罚值为0.5%。此净航迹用于进行障碍物评估，确保安全裕度。`,
      "relatedFormulas": [
        "净梯度 = 总梯度 - 梯度罚值 (e.g., 1.1% for twin OEI)"
      ],
      "regulatoryRequirement": `CS 25.123(b) / FAR 25.123(b): “单发失效的净航迹数据必须代表实际爬升性能，并减去一个爬升梯度，对于双发飞机为1.1%，对于四发飞机为1.6%。”`
    },
    {
      "nameEn": "En Route Obstacle Clearance (OEI)",
      "nameZh": "航路越障（单发失效）",
      "definition": "在单发失效的情况下，确保飞机的净飘降航迹在整个航路上与所有地形和障碍物保持足够的垂直和水平间隔。这是航路规划的核心部分，尤其是在飞越山区时。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS CAT.POL.A.215(b): “在航净航迹的梯度在航路沿线所有地形和障碍物上方至少1000英尺处应为正...”。\nAir OPS CAT.POL.A.215(c): “净航迹应允许飞机从巡航高度继续飞行...垂直超出[规定走廊内]所有地形和障碍物至少2000英尺。”\nFAR 121.191 (类似要求)`
    },
    {
      "nameEn": "Pressurization Failure Profile",
      "nameZh": "失压剖面",
      "definition": "在发生客舱失压后，为满足机上人员的供氧需求，飞机必须遵循的下降和飞行剖面。该剖面由机上氧气系统的能力（供氧时间）决定，飞机必须在该剖面限定的高度以下飞行，直到到达安全高度（通常为10000英尺）。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS CAT.IDE.A.230: (规定了在不同客舱高度下，需要为不同比例的乘客提供补充氧气)。\nFAR 121.329 / 121.333: (对补充氧气的供应和持续时间有类似要求)。`
    },
    {
      "nameEn": "ETOPS (Extended-range Twin-engine Operations)",
      "nameZh": "双发延程运行",
      "definition": "允许双发飞机在远离备降机场的航路上飞行的运行标准。核心要求是，飞机必须能在单发失效的情况下，在规定的最大改航时间内（如60分钟、120分钟、180分钟等）安全飞抵一个合适的备降机场。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS CAT.OP.MPA.140(a)(1): “（运营人不得运行双发飞机飞经某航路，如果该航路上某点距离一个合适机场的距离）超过在（经批准的）单发失效巡航速度下飞行60分钟的距离。”\nFAR 121.161 (类似规定)`
    }
];

module.exports = {
  inFlightPerformance
};