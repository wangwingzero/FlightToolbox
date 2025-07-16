/**
 * =================================================================
 *               Fuel Planning and Management Definitions
 * =================================================================
 *
 * Sourced and optimized from the Airbus document:
 * "Getting to Grips with Aircraft Performance", December 2024.
 *
 * This file contains structured data for key fuel planning and management
 * concepts, comparing EASA and FAA regulations.
 */

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