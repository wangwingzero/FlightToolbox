




// =================================================================
// 4. In-Flight Performance
// =================================================================

export const inFlightPerformance = [
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
    }
];

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

// =================================================================
// 6. Fuel Planning and Management
// =================================================================

export const fuelPlanningAndManagement = [
    {
      "nameEn": "Fuel/Energy Planning and Management",
      "nameZh": "燃油/能源计划与管理",
      "definition": "为确保飞行安全，在飞行前为计划航路计算所需最低燃油量的过程，以及在飞行中对燃油进行监控和管理的程序。规章允许在满足特定条件下采用不同灵活性的燃油计划方案（如基本方案、含变种的基本方案、独立方案）。",
      "relatedFormulas": [
        "Q = taxi fuel + TF + CF + AF + FR + Add + XF + DF (EASA)"
      ],
      "regulatoryRequirement": `EASA Air OPS CAT.OP.MPA.180(a): “每个运营商都应建立、实施和维护一个燃油/能源方案，该方案可以是：(i) 一个基本的燃油/能源方案... (ii) 一个含变种的基本燃油/能源方案... (iii) 一个独立的燃油/能源方案...”`
    },
    {
      "nameEn": "Taxi Fuel",
      "nameZh": "滑行燃油",
      "definition": "在起飞前，预计用于滑行、APU消耗等地面操作的燃油量。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS CAT.OP.MPA.181(c)(1): “（燃油量）不得少于预计在起飞前使用的量。”\nEASA Air OPS AMC1.CAT.OP.MPA.181(a): “运营商应考虑出发机场的当地条件和APU的消耗。”`
    },
    {
      "nameEn": "Trip Fuel (TF)",
      "nameZh": "航段燃油",
      "definition": "使飞机从起飞点（或在航重新计划点）飞抵目的地机场着陆所需的燃油/能源量。它包括起飞、爬升、巡航、下降、进近和着陆等所有飞行阶段的燃油消耗。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS CAT.OP.MPA.181(c)(2): “应为使飞机能够从起飞点或从在航重新计划点飞至目的地机场着陆所需的燃油/能源量。”`
    },
    {
      "nameEn": "Contingency Fuel (CF)",
      "nameZh": "航线备用燃油",
      "definition": "为补偿不可预见因素（如风、航路偏离等）而携带的燃油。EASA基本方案要求其为计划航段燃油的5%或5分钟等待燃油中的较大者。FAA的规定则有所不同。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS AMC1.CAT.OP.MPA.181(c): “航线备用燃油是以下两者中的较大值：● 计划航段燃油的5%，或在航重新计划时剩余航段燃油的5%。● 在标准条件下，在目的地机场上空1500英尺以等待速度飞行5分钟的燃油量。”\nFAR 121.645(b)(2) (Flag/Supplemental): “（燃油量需足够）在其后，飞行相当于从起飞机场飞至并降落在签派机场所需的总时间的10%。”`
    },
    {
      "nameEn": "Alternate Fuel (AF)",
      "nameZh": "备降燃油",
      "definition": "如果需要指定备降机场，从目的地机场复飞、爬升、巡航、下降并最终在备降机场着陆所需的燃油量。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS CAT.OP.MPA.181(c)(4): “当一个航班使用至少一个目的地备降场运行时，它应为从目的地机场飞往目的地备降场所需的燃油/能源量。”\nFAR 121.639(b): “（燃油量需足够）在其后，飞往并降落在（指定的）最远备降机场。”`
    },
    {
      "nameEn": "Final Reserve Fuel (FRF)",
      "nameZh": "最后储备燃油",
      "definition": "在完成所有其他飞行阶段后，飞机必须剩余的最低燃油量，用于在备降机场（或目的地机场，如无备降场）上空以等待速度等待一段时间。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS CAT.OP.MPA.181(c)(5): “...不得少于飞行30分钟的燃油/能源。”\nFAR 121.639(c) (Domestic): “...在其后，以正常巡航燃油消耗率飞行45分钟。”\nFAR 121.645(b)(4) (Flag/Supplemental): “...在其后，在标准温度条件下，在备降机场（或无备降场时的目的地机场）上空1500英尺以等待速度飞行30分钟。”`
    },
    {
      "nameEn": "Additional Fuel",
      "nameZh": "额外燃油",
      "definition": "当根据飞机失效情况（如发动机失效或失压）计算出的最低燃油量超过标准燃油（航段燃油至最后储备燃油）时，必须携带的燃油量，以确保飞机能从航路最关键点安全飞抵合适的备降场。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS CAT.OP.MPA.181(c)(6): “为使飞机能够在发生严重影响燃油/能源消耗的飞机故障时，在航路最关键点降落在航路备用机场所需的燃油/能源量。此额外燃油/能源仅在根据(c)(2)至(c)(5)点计算的最低燃油/能源量不足以应对此类事件时才需要。”`
    },
    {
      "nameEn": "Discretionary Fuel",
      "nameZh": "酌情燃油",
      "definition": "由机长全权决定携带的额外燃油，用于应对标准燃油计算未涵盖的潜在延误或其他情况。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS AMC1.CAT.OP.MPA.181(h): “由机长全权决定的燃油/能源量。”`
    },
    {
      "nameEn": "Reduced Contingency Fuel (RCF) Procedure",
      "nameZh": "减少航线备用燃油程序",
      "definition": "一种EASA燃油计划方案的变种，允许运营商在航路上预先设定一个“决策点”（Decision Point）。如果在此点之前飞行顺利，则可以继续飞往目的地，而只需携带从决策点到目的地航段燃油的5%作为备用燃油，从而减少总的备用燃油量。",
      "relatedFormulas": [
        "F1 = taxiA + tripAC + 5% tripBC + alternateCD + ...",
        "F2 = taxiA + tripAE + fuel_1.2.1.4.2 + ... "
      ],
      "regulatoryRequirement": `EASA Air OPS AMC6.CAT.OP.MPA.181(d): “如果运营商的燃油政策包括飞往目的地1机场（使用航路决策点的RCF商业目的地）和目的地2机场（可选的加油目的地）的飞行前计算所需可用燃油量应大于(1)或(2)点的总和：...”`
    },
    {
      "nameEn": "Isolated Airport Procedure",
      "nameZh": "孤立机场程序",
      "definition": "当目的地机场因地理位置偏远，没有可行的备降机场时采用的燃油计划程序。此程序不要求携带备降燃油，但要求携带足够的额外燃油，以确保飞机能从一个“无法返回点”（Point of No Return, PNR）继续飞往目的地，并在其上空巡航等待一段时间（EASA为2小时，FAA为2小时）。",
      "relatedFormulas": null,
      "regulatoryRequirement": `EASA Air OPS AMC7 CAT.OP.MPA.182(a): “如果到达最近的合格目的地备降场所需的备降燃油加上最后储备燃油（FRF）多于在目的地机场上空以正常巡航消耗率飞行2小时所需的燃油量（包括FRF），则运营商应将该目的地机场用作孤立机场。”\nFAR 121.645(c): “任何人不得将涡轮发动机飞机...放行至未根据§121.621(a)(2)或§121.623(b)指定备降场的机场，除非该飞机有足够的燃油...飞抵该机场，并在此后以正常巡航燃油消耗率飞行至少两小时。”`
    },
    {
      "nameEn": "Redispatch Procedure",
      "nameZh": "再签派程序",
      "definition": "一种FAA燃油计划程序，类似于EASA的RCF。飞机最初被签派到一个初始目的地（或加油机场），在飞行途中，如果条件允许，再重新签派到最终目的地。这允许飞机在起飞时携带较少的燃油，只需满足到达初始目的地的燃油要求即可。",
      "relatedFormulas": [
        "F1 = taxiA + tripAC + 10% trip timeBC + ...",
        "F2 = taxiA + tripAE + 10% trip timeBE + ..."
      ],
      "regulatoryRequirement": `FAR 121.631(a): “合格证持有人可将任何经批准的、适用于该飞机类型的定期、临时或加油机场，指定为初始签派或放行的目的地。”\nFAR 121.631(c): “任何人在飞机航行途中，不得将原始签派或放行中指定的初始目的地或备降机场更改为另一机场，除非该另一机场已获准用于该飞机类型，且在重新签派或修改飞行放行时满足了相应的要求…”`
    }
];