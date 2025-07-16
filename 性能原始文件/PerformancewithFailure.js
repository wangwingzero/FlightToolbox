// =================================================================
// 5. Performance with Failure
// =================================================================

export const performanceWithFailure = [
    {
      "nameEn": "In-Flight Performance with Failure",
      "nameZh": "失效情况下的在航性能",
      "definition": "分析飞机在遭遇发动机失效、增压系统失效或其他系统故障等非正常情况下的性能表现。审定标准要求对这些失效情况进行评估，以确保飞机能够安全地继续飞行至备降场或返航。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Engine Failure (In-Flight)",
      "nameZh": "在航发动机失效",
      "definition": "飞行中一台或多台发动机失效的情况。此时，剩余发动机的推力可能不足以维持飞机在当前巡航高度和速度平飞。飞机必须下降到一个新的、较低的平衡高度，在该高度上，剩余发动机的最大连续推力（MCT）足以平衡阻力。",
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
      "regulatoryRequirement": `CS/FAR 25.123(b): “单发失效的净航迹数据必须代表实际爬升性能，并减去一个爬升梯度，对于双发飞机为1.1%，对于四发飞机为1.6%。”\nCS/FAR 25.123(c): “双发失效（对于四发飞机）的净航迹数据必须代表实际爬升性能，并减去一个0.5%的爬升梯度。”`
    },
    {
      "nameEn": "En Route Obstacle Clearance (OEI)",
      "nameZh": "航路越障（单发失效）",
      "definition": "在单发失效的情况下，确保飞机的净飘降航迹在整个航路上与所有地形和障碍物保持足够的垂直和水平间隔。这是航路规划的核心部分，尤其是在飞越山区时。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS CAT.POL.A.215(b): “在航净航迹的梯度在航路沿线所有地形和障碍物上方至少1000英尺处应为正，该航路范围为预定航迹两侧9.3公里（5海里）内。”\nAir OPS CAT.POL.A.215(c): “净航迹应允许飞机从巡航高度继续飞行至一个可以着陆的机场，[...]，并在[规定的走廊内]垂直越过所有地形和障碍物至少2000英尺。”`
    },
    {
      "nameEn": "Diversion Airfield",
      "nameZh": "备降机场",
      "definition": "在发生发动机失效等紧急情况后，飞机计划前往并能够安全着陆的机场。航路研究必须确定沿途可用的备降机场，并确保飞机在到达备降机场上方1500英尺时，仍具有正的净爬升梯度。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS CAT.POL.A.215(a): “假定发动机失效后，飞机在预计着陆的机场上空1500英尺处，净航迹应具有正梯度。”`
    },
    {
      "nameEn": "Obstacle/Drift Down Strategy",
      "nameZh": "越障/飘降策略",
      "definition": "一种在飞越山区时遭遇发动机失效的应急程序。该策略包括：选择最大连续推力（MCT），减速至绿点速度（最佳升阻比速度），然后以绿点速度爬升或下降，直到达到飘降升限。此策略旨在最大化飞机高度，以获得最大的越障能力和安全裕度。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Pressurization Failure",
      "nameZh": "增压失效",
      "definition": "飞行中机舱增压系统失效，导致座舱高度迅速上升至与飞机飞行高度相同的情况。为了保证机组和乘客的生理安全（避免缺氧），飞机必须紧急下降至一个安全高度（通常是10000英尺）。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Passenger Oxygen Requirement",
      "nameZh": "旅客氧气需求",
      "definition": "规章对飞机在不同座舱高度下必须为旅客提供的补充氧气数量和持续时间的要求。这些要求决定了飞机在增压失效后，必须在多长时间内下降到安全高度。氧气系统的持续时间是飞机性能剖面计算的一个关键限制。",
      "relatedFormulas": null,
      "regulatoryRequirement": `GM1 CAT.IDE.A.230(b): “在计算急救氧气量时，运营商应考虑到...为以下情况提供补充氧气...：(1) 当客舱高度超过15000英尺时，为所有旅客；(2) 当客舱高度在14000至15000英尺之间时，为至少30%的旅客；以及(3) 当客舱高度在10000至14000英尺之间超过30分钟时，为至少10%的旅客。”\nCAT.IDE.A.230(b): “在(a)款中提到的氧气供应量应足够在客舱失压后，当客舱高度超过8000英尺但不超过15000英尺时，为至少2%的旅客提供余下航程的氧气，但在任何情况下不得少于一人。”`
    },
    {
      "nameEn": "ETOPS (Extended-range Twin-engine Operations)",
      "nameZh": "双发延程飞行",
      "definition": "允许双发飞机在远离备降机场的航路上飞行的运行标准和规章。ETOPS航路规划必须考虑在最关键点发生发动机失效或增压失效等多种紧急情况，并确保飞机有足够的性能和燃油安全到达备降机场。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS CAT.OP.MPA.140(a): “除非获得主管当局的批准[...]，否则运营商不得在一条航线上运营双发飞机，该航线包含一个距离合适机场比相应距离更远的点[...]：(1) 在[经批准的]单发失效巡航速度下飞行60分钟。”`
    },
    {
      "nameEn": "Guidance to Route Studies",
      "nameZh": "航路研究指南",
      "definition": "在开辟新航线前，必须进行的系统性评估，以确保在最坏的情况下（如在最关键点发生发动机或增压失效）存在可行的应急逃逸程序。研究需要结合飞机性能、地形数据、氧气系统限制和规章要求，确定关键点和应急程序，以确保飞行安全。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    }
];