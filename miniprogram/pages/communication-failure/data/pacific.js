/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - PACIFIC
 *
 * @remarks
 * This data is extracted from the PACIFIC AIRWAY MANUAL for reference only.
 * Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource eawm_pacific.pdf
 *
 * @version 1.0.0
 * @date 2025-07-06
 */
const ICAO_DIFFERENCES_COMM_FAILURE_PACIFIC = {
    "AUSTRALIA": {
        "region_name_en": "AUSTRALIA",
        "region_name_cn": "澳大利亚",
        "icao_differences": {
            "en": "Specifies a 60-minute rule for oceanic airspace instead of the standard 20 minutes and explicitly allows for Strategic Lateral Offset Procedures (SLOP).",
            "cn": "在海洋空域规定了60分钟的等待规则，以替代标准的20分钟，并明确允许执行战略性横向偏航程序 (SLOP)。"
        },
        "procedures": [
            {
                "en": "If in VMC and are certain of maintaining VMC, stay in VMC and land at the most suitable airport.",
                "cn": "如果在目视气象条件下（VMC）并确信能保持VMC，则应保持VMC飞行并在最合适的机场着陆。"
            },
            {
                "en": "In the event of total loss of communication, an aircraft shall: maintain the last assigned speed and level for a period of 60 minutes following the aircraft’s failure to report its position over a compulsory reporting point (including ADS-C flights), and thereafter adjust speed and altitude in accordance with the filed flight plan.",
                "cn": "如果通信完全中断，飞机应：在强制报告点未能报告其位置后，保持最后分配的速度和高度层飞行60分钟（包括ADS-C航班），然后根据所提交的飞行计划调整速度和高度。"
            },
            {
                "en": "In OCA, aircraft experiencing communication failure may also initiate strategic lateral offset procedures (SLOP) in accordance with ATC, General Flight Procedures, Operations in Oceanic Control Area, including an offset of up to 2 NM right of track.",
                "cn": "在海洋管制区（OCA）内，遭遇通信故障的飞机也可根据空中交通管制、通用飞行程序、海洋控制区操作程序启动战略性横向偏航程序（SLOP），包括向航迹右侧偏航最多2海里。"
            },
            {
                "en": "If a clearance limit involving an altitude or route restriction has been received and acknowledged: maintain last assigned level, or minimum safe altitude if higher, for three (3) minutes, and/or hold at nominated location for three (3) minutes, then proceed in accordance with the latest ATC route clearance acknowledged, and climb to planned level.",
                "cn": "如果已收到并确认了包含高度或航路限制的许可：保持最后分配的高度或最低安全高度（如果更高）三(3)分钟，和/或在指定位置等待三(3)分钟，然后按照最新确认的ATC航路许可继续飞行，并爬升至计划高度。"
            }
        ]
    },
    "INDONESIA": {
        "region_name_en": "INDONESIA",
        "region_name_cn": "印度尼西亚",
        "icao_differences": {
            "en": "Provides specific alternate routes and altitudes for diversion depending on the intended destination (e.g., Kuala Lumpur, Pekanbaru, Singapore).",
            "cn": "根据不同的目的地（如吉隆坡、北干巴鲁、新加坡），提供了具体的备降航路和高度。"
        },
        "procedures": [
            {
                "en": "If unable to land within 30 minutes of the time descent should have started (i.e. EAT or ETA if no EAT has been acknowledged), proceed to cross fix Holding Area at 4000 ft then via R461 at FL170 if Kuala Lumpur is the nominated alternate or via W12 at FL210 if Pekanbaru is the nominated alternate or via G468 at FL150 if Penang is the nominated alternate or via N563 at FL230 if Singapore is the nominated alternate otherwise proceed at the planned flight level to other nominated alternate.",
                "cn": "如果无法在应该开始下降的时间（即EAT，或在未收到EAT时为ETA）后的30分钟内着陆，应飞越定位点等待区，高度4000英尺，然后如果指定备降场为吉隆坡，则经R461飞往FL170高度层；如果为北干巴鲁，则经W12飞往FL210；如果为槟城，则经G468飞往FL150；如果为新加坡，则经N563飞往FL230；否则按计划的飞行高度层飞往其他指定的备降场。"
            }
        ]
    },
    "JAPAN": {
        "region_name_en": "JAPAN",
        "region_name_cn": "日本",
        "icao_differences": {
            "en": "The 7-minute rule for radar airspace only considers two conditions for the timer start (altitude reached or transponder set to 7600), omitting the third ICAO condition (failure to report). Descent timing is based on total flight plan time if EAT/ETA is unavailable.",
            "cn": "雷达空域的7分钟计时规则仅考虑两个计时起点（达到高度或设置应答机7600），省略了ICAO标准的第三个条件（未能报告位置）。在没有EAT/ETA的情况下，下降时机基于飞行计划的总时间。"
        },
        "procedures": [
            {
                "en": "In airspace where radar is used in the provision of air traffic control, for a period of 7 minutes following: the time the last assigned altitude or minimum altitude is reached; or the time the transponder is set to Code 7600 whichever is later.",
                "cn": "在提供空中交通管制的雷达空域，在最后分配的高度或最低高度到达之时，或应答机设置为7600编码之时（以较晚者为准）起，保持7分钟。"
            },
            {
                "en": "Commence descent without delay if approach clearance has been issued or commence descent in other cases after holding over the point until the time specified below: the estimated time of arrival (ETA), if no EAT has been received but the aircraft has reported to ATC regarding its ETA at the point; or the time which the total estimated elapsed time (the time inserted to field 16 of flight plan) has elapsed after take-off in cases other than (1) and (2) above.",
                "cn": "如果已发布进近许可，应立即开始下降；其他情况下，在定位点上空等待至下述时间后开始下降：如果未收到预计进近时间（EAT），但飞机已向ATC报告其在该点的预计到达时间（ETA），则按ETA执行；或在上述(1)和(2)以外的情况下，按起飞后已耗尽飞行计划第16项中填写的总预计飞行时间执行。"
            }
        ]
    },
    "KOREA_REPUBLIC_OF": {
        "region_name_en": "KOREA, REPUBLIC OF",
        "region_name_cn": "大韩民国",
        "icao_differences": {
            "en": "Mandatory requirement for two-way radio communications to be functional before any aircraft is permitted to take off.",
            "cn": "强制性要求，任何飞机在起飞前必须能够与空中交通管制保持双向无线电通信。"
        },
        "procedures": [
            {
                "en": "No person may take off unless two-way radio communications can be maintained with Air Traffic Control.",
                "cn": "除非能够与空中交通管制保持双向无线电通信，否则任何人不得起飞。"
            },
            {
                "en": "On recognition of communication failure during flight, squawk 7600 and if necessary to ensure safe altitude, climb to Minimum Safe Altitude or above to maintain obstacle clearance.",
                "cn": "在飞行中识别到通信故障时，应设置应答机编码7600，并在必要时为确保安全高度，爬升至最低安全高度或以上以保持障碍物越障能力。"
            }
        ]
    },
    "MALAYSIA": {
        "region_name_en": "MALAYSIA",
        "region_name_cn": "马来西亚",
        "icao_differences": {
            "en": "Provides specific, detailed procedures for communication failure during arrival into Kuala Lumpur TMA, including holding patterns and diversion routes to alternate runways.",
            "cn": "为抵达吉隆坡终端管制区（TMA）期间的通信故障提供了具体详细的程序，包括等待航线和备用跑道的分流路线。"
        },
        "procedures": [
            {
                "en": "In IMC, or if unable to maintain VFR, maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 20 minutes following the aircraft’s failure to report its position over a compulsory reporting point and thereafter adjust level and speed in accordance with the filed flight plan.",
                "cn": "在仪表气象条件（IMC）下，或无法保持目视飞行规则（VFR）时，飞机应在未能于强制报告点报告其位置后，保持最后分配的速度和高度（或最低飞行高度，取较高者）20分钟，然后根据已提交的飞行计划调整高度和速度。"
            },
            {
                "en": "Special Procedures for Kuala Lumpur Intl Airport — Sepang: If total radio communication failure occurs before being given and acknowledged a specific STAR, proceed via airways, thereafter the appropriate STAR for Rwy 32R to EGURI Holding Area (EHA). Commence descent over EHA at or as close as possible to the ETA. Carry out ILS APCH/GNSS APCH for Rwy 32R.",
                "cn": "吉隆坡国际机场-雪邦的特殊程序：如果在收到并确认具体标准终端到达（STAR）程序前发生完全无线电通信故障，应沿航路飞行，随后根据适用的STAR程序飞往32R跑道的EGURI等待区（EHA）。在EGURI等待区上空，于预计到达时间（ETA）或尽可能接近该时间开始下降。执行32R跑道的ILS进近/GNSS进近。"
            },
            {
                "en": "If landing on Rwy 32R is not possible, and in IMC, at missed approach point (MAPt) Rwy 32R carry out missed approach, proceed on Track 326°, climb and maintain 7000 ft. At 4 DME VKL or on PSG 4000 ft, turn Right to KK895. Carry out ILS APCH/GNSS APCH for Rwy 14L.",
                "cn": "如果无法在32R跑道着陆，并且处于仪表气象条件下（IMC），在32R跑道的复飞点（MAPt）执行复飞程序，沿326°航迹飞行，爬升并保持7000英尺。在距离VKL DME 4海里或到达PSG 4000英尺时，右转至KK895。执行14L跑道的ILS进近/GNSS进近。"
            }
        ]
    },
    "NEW_ZEALAND": {
        "region_name_en": "NEW ZEALAND",
        "region_name_cn": "新西兰",
        "icao_differences": {
            "en": "Specifies a 60-minute rule for oceanic airspace instead of the standard 20 minutes. For domestic airspace, a 5-minute rule applies after which the planned level is resumed.",
            "cn": "在海洋空域规定了60分钟的等待规则，以替代标准的20分钟。对于国内空域，则适用5分钟规则，之后恢复至计划高度层。"
        },
        "procedures": [
            {
                "en": "Auckland Oceanic FIR: maintain the last assigned speed and level for a period of 60 minutes following the aircraft's failure to report its position over a compulsory reporting point (including ADS-C flights), and thereafter adjust speed and level in accordance with the filed flight plan.",
                "cn": "奥克兰海洋飞行情报区：在强制报告点未能报告其位置后（包括ADS-C航班），保持最后分配的速度和高度60分钟，然后根据已提交的飞行计划调整速度和高度。"
            },
            {
                "en": "New Zealand FIR: maintain the last assigned level, or minimum flight altitude if higher, for five minutes, then climb to maintain the level(s) specified in the current flight plan.",
                "cn": "新西兰飞行情报区：保持最后分配的高度或最低飞行高度（取较高者）五分钟，然后爬升至当前飞行计划中指定的高度层。"
            }
        ]
    },
    "THAILAND": {
        "region_name_en": "THAILAND",
        "region_name_cn": "泰国",
        "icao_differences": {
            "en": "Specifies a 10-minute rule for maintaining the last assigned speed and level, which differs from the ICAO standard 7 or 20-minute rules.",
            "cn": "规定了保持最后分配速度和高度的10分钟规则，这与ICAO标准的7分钟或20分钟规则不同。"
        },
        "procedures": [
            {
                "en": "If in IMC, or when the pilot of an IFR flight considers it inadvisable to complete the flight, the pilot shall maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of ten minutes following the aircraft's failure to report its position over a compulsory reporting point and thereafter adjust level and speed in accordance with the filed flight plan.",
                "cn": "如果在仪表气象条件下，或当IFR航班的飞行员认为无法完成飞行时，飞行员应在强制报告点未能报告其位置后，保持最后分配的速度和高度（或最低飞行高度，如果更高）十分钟，之后根据已提交的飞行计划调整高度和速度。"
            },
            {
                "en": "For departing aircraft, the pilot shall maintain the last assigned heading, speed and level, or minimum flight altitude if higher, for a period of two minutes. After a period of two minutes, the pilot shall proceed in the most direct manner possible to rejoin the SID procedure appropriate to its ATS route or the flight planned route no later than the next significant point.",
                "cn": "对于离场飞机，飞行员应保持最后分配的航向、速度和高度（或最低飞行高度，如果更高）两分钟。两分钟后，飞行员应以最直接的方式重新加入适合其ATS航路或飞行计划航路的SID程序，且不晚于下一个重要航路点。"
            }
        ]
    }
};

// 导出模块
module.exports = {
    ICAO_DIFFERENCES_COMM_FAILURE_PACIFIC
};