/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - MIDDLE EAST
 *
 * @remarks
 * This data is extracted from the MIDDLE EAST AIRWAY MANUAL for reference only.
* Before actual operation, please be sure to refer to the complete official and latest documentation.
 * This version combines the standardized structure of ISO country codes with the detailed procedural content from user-provided data for maximum accuracy and usability.
 *
 * @dataSource eawm_middle_east.pdf
 *
 * @version 1.0.0
 * @date 2025-07-06
 */
const ICAO_DIFFERENCES_COMM_FAILURE_MIDDLE_EAST = {
        "IRAQ": {
            "region_name_en": "IRAQ",
            "region_name_cn": "伊拉克",
            "icao_differences": {
                "en": "Specifies maintaining last assigned flight level for 3 minutes after squawking 7600 or reaching the level, whichever is later, before proceeding with the flight plan.",
                "cn": "规定在应答机设置为7600或到达最后指定高度层（取其后）后，保持该高度层飞行3分钟，然后再根据飞行计划继续飞行。"
            },
            "procedures": [
                {
                    "en": "Maintain last assigned flight level, or minimum flight altitude if higher, for a period of 3 minutes after: squawking 7600; or reaching last assigned flight level/minimum flight altitude; or not reporting at a compulsory reporting point whichever is later. Thereafter continue according to the current flight plan.",
                    "cn": "在应答机设置为7600，或到达最后指定的高度层/最低飞行高度，或未能在强制报告点报告三者中较晚的时间点之后，继续保持最后指定的高度层或最低飞行高度（如果更高）飞行3分钟。之后，按照现行飞行计划继续飞行。"
                }
            ]
        },
        "ISRAEL": {
            "region_name_en": "ISRAEL",
            "region_name_cn": "以色列",
            "icao_differences": {
                "en": "Provides detailed, route-specific procedures for arrivals from different FIRs (west, south, north), including specific holding patterns, descent altitudes, and STARs to follow for LLBG.",
                "cn": "为来自不同飞行情报区（西部、南部、北部）的进港航班提供了详细的、特定于航路的程序，包括具体的等待航线、下降高度以及前往特拉维夫本-古里安机场（LLBG）需遵循的标准终端到港程序（STAR）。"
            },
            "procedures": [
                {
                    "en": "In VMC: ICAO Procedure.",
                    "cn": "在目视气象条件下（VMC）：遵循ICAO程序。"
                },
                {
                    "en": "In IMC: ICAO Procedure, supplemented as follows: GENERAL Attempt to establish communications with the appropriate ATC unit using all other available means.",
                    "cn": "在仪表气象条件下（IMC）：遵循ICAO程序，并补充如下：总则：尝试使用所有其他可用方式与相应的ATC单位建立通信。"
                },
                {
                    "en": "Arrival Procedure a. From the west (Tel Aviv Control): 1. Proceed to KONFO at the last flight level acknowledged. If above FL290, enter the holding over KONFO as published and descend to FL290 while holding. 2. Over KONFO: – Destination Tel Aviv (Ben Gurion) LLBG: Descend to 12000ft while holding. At 12000ft follow STAR AMMOS 1A, for the ILS approach to RWY 26. – Destination airports at Amman FIR: • Destination Aqaba (King Hussein Intl) OJAQ: Proceed via L609-N134, maintain 29000ft to SALAM. • Other airports: Descend to 15000ft while holding. At 15000ft proceed via L609-N134, maintain 15000ft to SALAM. – Destination Eilat (Ilan and Asaf Ramon) LLER: Proceed via L609-N134, maintain last acknowledged altitude, but not higher than 29000ft to ADLOD, thence J10 to SIVAK. After SIVAK follow the procedure prescribed in b. below.",
                    "cn": "进港程序 a. 从西部（特拉维夫管制）进入：1. 飞往KONFO，保持最后确认的高度层。如果高于FL290，则进入KONFO上空发布的等待航线并下降至FL290。 2. 到达KONFO上空后： – 目的地为特拉维夫本-古里安机场（LLBG）：在等待时下降至12000英尺。到达12000英尺后，遵循AMMOS 1A标准终端到港程序（STAR），执行26号跑道的ILS进近。– 目的地为安曼飞行情报区内的机场：• 目的地为亚喀巴侯赛因国王国际机场（OJAQ）：经L609-N134航路飞往SALAM，保持29000英尺。• 其他机场：在等待时下降至15000英尺。到达15000英尺后，经L609-N134航路飞行，保持15000英尺至SALAM。– 目的地为埃拉特伊兰和阿萨夫拉蒙机场（LLER）：经L609-N134航路飞往ADLOD，保持最后确认的高度，但不高于29000英尺，然后经J10飞往SIVAK。到达SIVAK后，遵循下文b段所述的程序。"
                }
            ]
        },
        "JORDAN": {
            "region_name_en": "JORDAN",
            "region_name_cn": "约旦",
            "icao_differences": {
                "en": "Specifies that a departing IFR flight should maintain the intermediate cleared level for 3 minutes before continuing with the flight plan.",
                "cn": "规定离场的IFR航班应在中间许可高度层保持3分钟，然后根据飞行计划继续飞行。"
            },
            "procedures": [
                {
                    "en": "A departing controlled IFR flight operating in IMC having acknowledged an intermediate clearance to climb to a level other than the one specified in the current flight plan for the enroute phase of the flight, and experiencing radio communication failure, shall, if no time or geographical limit was included in the climb clearance, maintain for a period of 3 minutes the level to which it was cleared and then continue its flight in accordance with the current flight plan.",
                    "cn": "在仪表气象条件下（IMC）离场的受管制IFR航班，如果已确认收到爬升至并非现行飞行计划航路阶段指定高度层的中间许可，并且发生无线电通信失效，若该爬升许可中未包含时间或地理限制，则应在已许可的高度层保持飞行3分钟，然后根据现行飞行计划继续飞行。"
                }
            ]
        },
        "KUWAIT": {
            "region_name_en": "KUWAIT",
            "region_name_cn": "科威特",
            "icao_differences": {
                "en": "Specifies maintaining last assigned heading and flight level for 3 minutes after departure under radar control before proceeding according to the flight plan.",
                "cn": "规定在雷达管制下离场后，应保持最后的航向和高度层飞行3分钟，然后根据现行飞行计划继续飞行。"
            },
            "procedures": [
                {
                    "en": "DEPARTURE PROCEDURE FOR FLIGHTS UNDER RADAR CONTROL. Visual Meteorological Conditions (VMC): Continue to fly in VMC and land at the nearest suitable aerodrome. Instrument Meteorological Conditions (IMC): Maintain last assigned heading and flight level or altitude for a period of 3 minutes after departure. Thereafter continue according to current flight plan by routing direct to the first enroute reporting point and climbing to the last acknowledged enroute flight level cleared by ATC.",
                    "cn": "雷达管制下离场航班程序。目视气象条件（VMC）：继续在VMC下飞行，并在最近的合适机场着陆。仪表气象条件（IMC）：离场后，保持最后指定的航向和高度层或高度飞行3分钟。之后，通过直接飞往航路上的第一个报告点并爬升至ATC许可的最后确认的航路高度层，按照现行飞行计划继续飞行。"
                }
            ]
        },
        "LEBANON": {
            "region_name_en": "LEBANON",
            "region_name_cn": "黎巴嫩",
            "icao_differences": {
                "en": "Specifies for aircraft under radar control to maintain the last assigned heading and level for 3 minutes before applying general ICAO procedures.",
                "cn": "规定在雷达管制下的飞机应保持最后指定的航向和高度层飞行3分钟，然后再应用通用的ICAO程序。"
            },
            "procedures": [
                {
                    "en": "Aircraft under radar control experiencing radio failure shall select Mode A Code 7600 and maintain the last assigned heading and level for a period of three minutes, after which time the general ICAO procedures shall apply.",
                    "cn": "在雷达管制下遭遇无线电故障的飞机，应选择应答机A模式编码7600，并保持最后指定的航向和高度层飞行三分钟，之后适用通用的ICAO程序。"
                }
            ]
        },
        "OMAN": {
            "region_name_en": "OMAN",
            "region_name_cn": "阿曼",
            "icao_differences": {
                "en": "Provides a specific recovery procedure for Muscat airport (OOMS), requiring a turn to a 020° magnetic heading, climb to 6000ft QNH, and proceeding to the MUSCAT DVOR/DME.",
                "cn": "提供了针对马斯喀特机场（OOMS）的特定恢复程序，要求转向磁航向020°，爬升至QNH 6000英尺，然后飞往马斯喀特DVOR/DME。"
            },
            "procedures": [
                {
                    "en": "Below 9000 QNH to read: If in VMC, continue flight in VMC. If in IMC, when on a heading to intercept RWY 08L/26R or 08R/26L extended centerline and a failure is experienced or suspected, make the shortest turn onto a heading of 020° MAG, climb to 6000ft QNH, proceed to MUSCAT DVOR/DME and comply with ICAO procedure to land on RWY 08L/26R. If unable to land, climb in the DVOR/DME holding pattern and depart TMA at applicable minimum enroute level, proceed to alternate.",
                    "cn": "在QNH 9000英尺以下：如果在目视气象条件（VMC）下，则继续在VMC下飞行。如果在仪表气象条件（IMC）下，当飞机正处于拦截08L/26R或08R/26L号跑道延长中心线的航向上时遭遇或怀疑通信失效，应以最短距离转向磁航向020°，爬升至QNH 6000英尺，飞往马斯喀特（MUSCAT）DVOR/DME，并遵循ICAO程序在08L/26R号跑道上降落。如果无法降落，则在DVOR/DME等待航线中爬升，并以适用的最低航路高度离开终端管制区（TMA），飞往备降机场。"
                }
            ]
        },
        "QATAR": {
            "region_name_en": "QATAR",
            "region_name_cn": "卡塔尔",
            "icao_differences": {
                "en": "Specifies maintaining the last assigned speed and level for 3 minutes after reaching the level or setting transponder to 7600, whichever is later.",
                "cn": "规定在到达最后指定高度层或设置应答机为7600（取其后）之后，保持最后指定的速度和高度层飞行3分钟。"
            },
            "procedures": [
                {
                    "en": "Maintain the last assigned speed and level, or minimum flight altitude, whichever is higher, for a period of 3 minutes following: the last assigned level or minimum flight altitude is reached; or the last time the transponder is set to Code 7600; whichever is later, and thereafter adjust level and speed in accordance with the filed flight plan.",
                    "cn": "在到达最后指定的高度层或最低飞行高度，或最后一次将应答机设置为编码7600（以较晚者为准）之后，保持最后指定的速度和高度层，或最低飞行高度（如果更高）飞行3分钟，然后根据已提交的飞行计划调整高度层和速度。"
                }
            ]
        },
        "SAUDI_ARABIA": {
            "region_name_en": "SAUDI ARABIA",
            "region_name_cn": "沙特阿拉伯",
            "icao_differences": {
                "en": "Specifies squawking 2000 for uncoordinated flights over the Red Sea, with specific cruising levels (FL290 southbound, FL300 northbound for RVSM; FL250/FL260 for non-RVSM).",
                "cn": "规定在红海上空进行非协调飞行时，应答机编码设为2000，并明确了巡航高度层（RVSM：南行FL290，北行FL300；非RVSM：南行FL250，北行FL260）。"
            },
            "procedures": [
                {
                    "en": "Uncoordinated flights over the Red Sea shall comply with the following procedures: a. Squawk A2000 if no code was issued by the transferring authority. b. RVSM compliant aircraft shall be in level flight and maintaining FL290 southbound and FL300 northbound. c. Non-RVSM compliant aircraft shall be in level flight and maintaining FL250 southbound and FL260 northbound.",
                    "cn": "在红海上空的非协调飞行应遵守以下程序： a. 如果交接管制单位未指定编码，应答机应设置为A模式2000。 b. 符合RVSM（缩小垂直间隔标准）的飞机应保持平飞，南行时保持FL290，北行时保持FL300。 c. 不符合RVSM的飞机应保持平飞，南行时保持FL250，北行时保持FL260。"
                }
            ]
        },
        "TURKIYE": {
            "region_name_en": "TURKIYE",
            "region_name_cn": "土耳其",
            "icao_differences": {
                "en": "Specifies maintaining the last assigned speed and level for a period of 7 minutes, with the 7-minute period starting from one of three conditions, whichever is later.",
                "cn": "规定保持最后指定的速度和高度层飞行7分钟，该7分钟的计时起点为三个条件中最后发生的一个。"
            },
            "procedures": [
                {
                    "en": "In IMC: A controlled flight experiencing communication failure in IMC, or where it does not appear feasible to continue in VMC shall: a. set transponder to Code 7600; b. maintain for a period of 7 minutes the last assigned speed and level. The period of 7 minutes commences: – at the time the transponder is set to Code 7600; or – at the time the last assigned level or minimum flight altitude is reached; or – at the time of a failed position report over a compulsory reporting point; whichever is later;",
                    "cn": "在仪表气象条件下（IMC）：在IMC中或在无法继续VMC飞行的情况下，遭遇通信失效的受管制航班应：a. 将应答机设置为编码7600；b. 保持最后指定的速度和高度层飞行7分钟。该7分钟的计时起点为以下三者中最后发生的时间点：– 应答机设置为编码7600的时间；或 – 到达最后指定高度层或最低飞行高度的时间；或 – 未能在强制报告点报告位置的时间；以较晚者为准；"
                }
            ]
        },
        "UNITED_ARAB_EMIRATES": {
            "region_name_en": "UNITED ARAB EMIRATES",
            "region_name_cn": "阿拉伯联合酋长国",
            "icao_differences": {
                "en": "For aircraft under radar control, maintain the last assigned heading and level for a period of 3 minutes before complying with standard ICAO procedures.",
                "cn": "对于雷达管制下的飞机，在遵循标准ICAO程序前，应保持最后指定的航向和高度层飞行3分钟。"
            },
            "procedures": [
                {
                    "en": "In IMC: ICAO Procedure, supplemented as follows: GENERAL Aircraft experiencing radio communication failure while under radar control shall maintain last assigned heading and level for a period of 3 minutes and then comply with standard procedures.",
                    "cn": "在仪表气象条件下（IMC）：遵循ICAO程序，并补充如下：总则：在雷达管制下遭遇无线电通信故障的飞机，应保持最后指定的航向和高度层飞行3分钟，然后遵守标准程序。"
                }
            ]
        },
        "YEMEN": {
            "region_name_en": "YEMEN",
            "region_name_cn": "也门",
            "icao_differences": {
                "en": "Specifies for departing IFR flights to maintain the intermediate cleared level for 3 minutes before continuing with the flight plan.",
                "cn": "规定离场的IFR航班应在中间许可高度层保持3分钟，然后根据飞行计划继续飞行。"
            },
            "procedures": [
                {
                    "en": "A departing controlled IFR in IMC, having acknowledged an intermediate clearance to climb to a level other than the one specified in the current flight plan for the enroute phase of the flight, and experiencing radio communication failure, shall, if no time or geographical limit was included in the climb clearance, maintain for a period of 3 minutes the level to which it was cleared and then continue its flight in accordance with the current flight plan.",
                    "cn": "在仪表气象条件下（IMC）离场的受管制IFR航班，如果已确认收到爬升至并非现行飞行计划航路阶段指定高度层的中间许可，并且发生无线电通信失效，若该爬升许可中未包含时间或地理限制，则应在已许可的高度层保持飞行3分钟，然后根据现行飞行计划继续飞行。"
                }
            ]
        }
    };
    
    // 导出模块
    module.exports = {
        ICAO_DIFFERENCES_COMM_FAILURE_MIDDLE_EAST
    };