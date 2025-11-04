/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - NORTH AMERICA
 *
 * @remarks
 * This data is extracted from the NORTH AMERICA AIRWAY MANUAL for reference only.
 * Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource eawm_north_america.pdf
 *
 * @version 1.2.0
 * @date 2025-07-08
 */
const ICAO_DIFFERENCES_COMM_FAILURE_NORTH_AMERICA = {
        "USA": {
            "region_name_en": "UNITED STATES",
            "region_name_cn": "美国",
            "icao_differences": {
                "en": "Specifies a clear hierarchy for route selection (AVE F: Assigned, Vectored, Expected, Filed) and altitude selection (MEA: Minimum IFR, Expected, Assigned - highest of the three). Notably, it does not include the ICAO standard 7-minute or 20-minute holding period.",
                "cn": "为航路选择（AVE F：指定的、引导的、预期的、计划的）和高度选择（MEA：最低IFR高度、预期高度、指定高度三者中的最高者）规定了清晰的层级。值得注意的是，其程序不包含ICAO标准的7分钟或20分钟等待时间。"
            },
            "procedures": [
                {
                    "en": "If the failure occurs in VFR conditions, or if VFR conditions are encountered after the failure, each pilot must continue the flight under VFR and land as soon as practicable.",
                    "cn": "如果通信故障发生在VMC(目视气象条件)下，或在故障后遇到VMC，飞行员必须在VFR下继续飞行并尽快着陆。"
                },
                {
                    "en": "If the failure occurs in IFR conditions, for route selection, comply with the following order: 1. Assigned route; 2. If being vectored, the direct route to the fix specified in the vector clearance; 3. Expected route; 4. Filed route.",
                    "cn": "如果故障发生在IMC(仪表气象条件)下，在航路选择上，应按以下顺序执行：1. 指定的航路；2. 若正在被引导，则按引导许可中指定的定位点的直接航路；3. 预期的航路；4. 申报的航路。"
                },
                {
                    "en": "For altitude selection, fly the HIGHEST of the following: 1. The altitude or flight level assigned in the last ATC clearance; 2. The minimum altitude for IFR operations; 3. The altitude or flight level ATC has advised may be expected.",
                    "cn": "在高度选择上，飞以下三者中的最高者：1. 最后ATC许可中指定的高度或高度层；2. IFR运行的最低高度；3. ATC已通知的预计高度或高度层。"
                },
                {
                    "en": "When the clearance limit is a fix from which an approach begins, commence descent and approach as close as possible to the Expect-Further-Clearance (EFC) time, or if none, the ETA.",
                    "cn": "当许可终点是进近起始定位点时，应尽可能接近预计后续许可（EFC）时间开始下降和进近，如无EFC时间，则按预计到达时间（ETA）执行。"
                }
            ]
        },
        "ICELAND": {
            "region_name_en": "ICELAND",
            "region_name_cn": "冰岛",
            "icao_differences": {
                "en": "Provides a specific supplementary procedure for aircraft under radar vectors, instructing them to proceed by the most direct route to the fix specified in the last vector clearance.",
                "cn": "为接受雷达引导的航空器提供了具体的补充程序，指示其按最直接的航线飞往最后雷达引导许可中指定的定位点。"
            },
            "procedures": [
                {
                    "en": "In IMC, for an aircraft under radar vectors, if communication is lost the pilot is expected to proceed by the most direct route practicable to the navaid/position/route as specified in the last clearance.",
                    "cn": "在IMC下，对于一架正在接受雷达引导的航空器，如果通信中断，飞行员应按最直接的可行航线飞往最后许可中指定的导航设备/位置/航路。"
                }
            ]
        },
        "GREENLAND": {
            "region_name_en": "GREENLAND",
            "region_name_cn": "格陵兰",
            "icao_differences": {
                "en": "Specifies maintaining assigned flight level to the FIR boundary in Sondrestrom FIR, and for flights over the ice cap, to climb to MORA, proceed to the coast, and then descend to the last assigned level.",
                "cn": "在桑德斯特伦FIR内规定保持指定高度层至FIR边界；对于飞越冰盖的航班，需爬升至最低偏航航路高度(MORA)，飞至海岸，然后下降至最后指定的高度层。"
            },
            "procedures": [
                {
                    "en": "Aircraft which suffer a communication failure in the Sondrestrom FIR shall, unless otherwise instructed, maintain the assigned flight level and track to the FIR boundary. [cite: 83]",
                    "cn": "在桑德斯特伦FIR（飞行情报区）内遭遇通信故障的航空器，除非另有指示，应保持指定的高度层和航迹直至飞离FIR边界。 [cite: 83]"
                },
                {
                    "en": "Aircraft which suffer a communication failure over the Greenland Icecap, outside radar and VHF coverage, shall climb to or maintain the MORA as shown on the enroute charts and proceed on the assigned track or the track plotted on the P-f chart to the coast of Greenland. [cite: 83]",
                    "cn": "在格陵兰冰盖上空、雷达和甚高频（VHF）覆盖范围之外遭遇通信故障的航空器，应爬升至或保持航路图上所示的最低偏航航路高度（MORA），并沿指定航迹或P-f图上标绘的航迹飞往格陵兰海岸。 [cite: 83]"
                },
                {
                    "en": "After passing the coast, the aircraft shall descend to the altitude/flight level last assigned by ATC and proceed in accordance with the flight plan. [cite: 83]",
                    "cn": "飞越海岸后，航空器应下降至空中交通管制（ATC）最后指定的高度/飞行高度层，并按照飞行计划继续飞行。 [cite: 83]"
                }
            ]
        }
    };
    
    // 导出模块
    module.exports = {
        ICAO_DIFFERENCES_COMM_FAILURE_NORTH_AMERICA
    };
    