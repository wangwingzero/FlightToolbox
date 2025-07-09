/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - AFRICA (Merged Version)
 *
 * @remarks
 * This data combines the comprehensiveness of one source with the structural integrity of another for enhanced usability.
 * It is intended for reference only. Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource eawm_africa.pdf (Compiled from multiple analyses)
 *
 * @version 2.0.0
 * @date 2025-07-08
 */
const ICAO_DIFFERENCES_COMM_FAILURE_AFRICA_MERGED = {
    "ALGERIA": {
        "region_name_en": "ALGERIA",
        "region_name_cn": "阿尔及利亚",
        "icao_differences": {
            "en": "Specifies a 7-minute rule for maintaining the last assigned speed and level after communication failure in IMC within radar coverage (from 30°N northwards).",
            "cn": "规定了在雷达覆盖范围内的IMC通信失效后，保持最后指定速度和高度层7分钟的规则（适用于30°N以北空域）。"
        },
        "procedures": [
            {
                "en": "VISUAL METEOROLOGICAL CONDITIONS. A controlled flight experiencing communication failure in VMC shall: 1. set transponder to code 7600; 2. continue fly in VMC; 3. land at the nearest suitable aerodrome, and 4. report its arrival time by the most expeditious means to the appropriate ATS unit.",
                "cn": "目视气象条件。在VMC下经历通信失效的受管制航班应：1. 将应答机设置为代码7600；2. 继续在VMC下飞行；3. 在最近的合适机场着陆，并 4. 以最快捷的方式向适当的ATS单位报告其到达时间。"
            },
            {
                "en": "INSTRUMENT METEOROLOGICAL CONDITIONS. A controlled flight experiencing communication failure in IMC, or where it does not appear feasible to continue in VMC shall: 1. set transponder to code 7600; 2. maintain for a period of 7 minutes the last assigned speed and level or the minimum flight altitude, if the minimum flight altitude is higher than the assigned level.",
                "cn": "仪表气象条件。在IMC中或在无法继续VMC飞行的情况下，经历通信失效的受管制航班应：1. 将应答机设置为代码7600；2. 保持最后分配的速度和高度层，或最低飞行高度（如果最低飞行高度高于指定高度层），持续7分钟。"
            },
            {
                "en": "The period of 7 minutes commences: a. if operating on a route without compulsory reporting points or if instructions have been received to omit position reports: at the time the last assigned level or minimum flight altitude is reached; or at the time the transponder is set to code 7600, whichever is later; or b. if operating on a route with compulsory reporting points and no instruction to omit position report has been received: at the time the last assigned level or minimum flight altitude is reached; or at the previously reported pilot estimate for the compulsory reporting point; or at the time of a failed position report over a compulsory reporting point, whichever is later.",
                "cn": "7分钟的计时开始于：a. 如果在没有强制报告点的航路上运行，或已收到省略位置报告的指令：在达到最后分配的高度层或最低飞行高度时；或在将应答机设置为代码7600时，以较晚者为准；或 b. 如果在有强制报告点的航路上运行且未收到省略位置报告的指令：在达到最后分配的高度层或最低飞行高度时；或在先前报告的强制报告点预计时间；或在强制报告点报告位置失败时，以三者中较晚者为准。"
            },
            {
                "en": "Thereafter, adjust level and speed in accordance with the filed flight plan; proceed according to the current flight plan route to the appropriate designated navigation aid or fix serving the destination airport and, when required, hold over this aid or fix until commencement of descent; commence descent at the EAT or ETA, complete a normal instrument approach, and land, if possible, within 30 minutes after the EAT or ETA.",
                "cn": "此后，根据已提交的飞行计划调整高度层和速度；根据当前飞行计划航路飞往为目的地机场服务的适当指定导航设备或定位点，并在需要时等待直至开始下降；在预计进近时间（EAT）或预计到达时间（ETA）开始下降，完成正常的仪表进近程序，并尽可能在EAT或ETA后30分钟内着陆。"
            }
        ]
    },
    "BENIN": {
        "region_name_en": "BENIN",
        "region_name_cn": "贝宁",
        "icao_differences": {
            "en": "Specifies procedures for Cotonou TMA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了科托努TMA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "COTONOU TMA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "科托努TMA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "BOTSWANA": {
        "region_name_en": "BOTSWANA",
        "region_name_cn": "博茨瓦纳",
        "icao_differences": {
            "en": "Specifies detailed IMC procedures focusing on proceeding to the initial approach fix, holding, and commencing descent based on EAT or ETA.",
            "cn": "规定了详细的IMC程序，重点是飞往起始进近定位点、等待、并根据EAT或ETA开始下降。"
        },
        "procedures": [
            {
                "en": "In IMC: If unable to continue in VMC, the aircraft shall proceed according to the current flight plan to the appropriate navigational aid, hold until the EAT or ETA, commence descent, complete a normal instrument approach, and land, if possible, within thirty minutes after the EAT or ETA.",
                "cn": "在IMC中：如果无法继续在VMC下飞行，航空器应根据当前飞行计划飞往相应的导航设备，等待至预计进近时间（EAT）或预计到达时间（ETA）后开始下降，完成正常的仪表进近程序，并尽可能在EAT或ETA后三十分钟内着陆。"
            }
        ]
    },
    "BURKINA_FASO": {
        "region_name_en": "BURKINA FASO",
        "region_name_cn": "布基纳法索",
        "icao_differences": {
            "en": "Specifies procedures for Ouagadougou TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了瓦加杜古TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "OUAGADOUGOU TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "瓦加杜古TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "CAMEROON": {
        "region_name_en": "CAMEROON",
        "region_name_cn": "喀麦隆",
        "icao_differences": {
            "en": "Specifies procedures for Douala TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了杜阿拉TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "DOUALA TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "杜阿拉TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "CANARY_ISLANDS": {
        "region_name_en": "CANARY ISLANDS",
        "region_name_cn": "加那利群岛",
        "icao_differences": {
            "en": "Specifies a 7-minute rule for IMC communication failure within Canaries TMA and a 20-minute rule for airspace outside the TMA.",
            "cn": "规定了在加那利TMA内IMC通信失效时采用7分钟规则，在TMA外空域采用20分钟规则。"
        },
        "procedures": [
            {
                "en": "INSTRUMENT METEOROLOGICAL CONDITIONS WITHIN CANARIES TMA. A controlled flight experiencing communication failure in IMC shall set transponder to 7600 and maintain for a period of 7 minutes the last assigned speed and level. The 7-minute period commences at the time the last level is reached, the transponder is set, or at a failed reporting point, whichever is later.",
                "cn": "加那利TMA内的仪表气象条件。在IMC下经历通信失效的受管制航班应将应答机设置为7600，并保持最后分配的速度和高度层7分钟。7分钟的计时始于到达最后高度层、设置应答机或在报告点报告失败三者中的最晚时间。"
            },
            {
                "en": "INSTRUMENT METEOROLOGICAL CONDITIONS OUTSIDE CANARIES TMA. A controlled flight experiencing communication failure in IMC shall set transponder to 7600 and maintain the last assigned speed and level for a period of 20 minutes from the time the aircraft fails to report its position over a compulsory reporting point. Thereafter, adjust level and speed in accordance with the filed flight plan.",
                "cn": "加那利TMA外的仪表气象条件。在IMC下经历通信失效的受管制航班应将应答机设置为7600，并在未能报告强制报告点位置后，保持最后分配的速度和高度层20分钟。此后，根据已提交的飞行计划调整高度层和速度。"
            }
        ]
    },
    "CHAD": {
        "region_name_en": "CHAD",
        "region_name_cn": "乍得",
        "icao_differences": {
            "en": "Specifies procedures for Ndjamena TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了恩贾梅纳TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "NDJAMENA TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "恩贾梅纳TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "COMOROS": {
        "region_name_en": "COMOROS",
        "region_name_cn": "科摩罗",
        "icao_differences": {
            "en": "Specifies procedures for Moroni TMA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了莫罗尼TMA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "MORONI TMA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "莫罗尼TMA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "CONGO_REP_OF": {
        "region_name_en": "CONGO, REP. OF",
        "region_name_cn": "刚果共和国",
        "icao_differences": {
            "en": "Specifies procedures for Brazzaville TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了布拉柴维尔TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "BRAZZAVILLE TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "布拉柴维尔TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "COTE_DIVOIRE": {
        "region_name_en": "COTE D'IVOIRE",
        "region_name_cn": "科特迪瓦",
        "icao_differences": {
            "en": "Specifies procedures for Abidjan TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了阿比让TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "ABIDJAN TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "阿比让TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "EGYPT": {
        "region_name_en": "EGYPT",
        "region_name_cn": "埃及",
        "icao_differences": {
            "en": "Provides specific departure procedures for communication failure, including maintaining the last cleared level for 7 minutes and rejoining the flight plan route if under radar vectoring.",
            "cn": "提供了通信失效时的特定离场程序，包括保持最后许可的高度层7分钟，以及在接受雷达引导时重新加入飞行计划航路。"
        },
        "procedures": [
            {
                "en": "DEPARTURE PROCEDURE. A departing IFR flight in IMC experiencing communication failure after acknowledging a climb to a level different from the flight plan shall maintain the cleared level for 7 minutes, then climb to the flight plan level. If being vectored by radar, proceed in the most direct manner to rejoin the flight plan route.",
                "cn": "离场程序。在IMC下离场的IFR航班，在确认爬升至一个与飞行计划不同的高度层后若通信失效，应保持该许可高度层7分钟，然后爬升至飞行计划高度层。若正在接受雷达引导，应以最直接的方式重新加入飞行计划航路。"
            },
            {
                "en": "CAIRO (INTL) AIRPORT Arrival Procedure. In case of complete communication failure, pilots should contact Cairo Tower or Approach via telephone.",
                "cn": "开罗（国际）机场到达程序。在完全通信失效的情况下，飞行员应通过电话联系开罗塔台或进近。"
            }
        ]
    },
    "ERITREA": {
        "region_name_en": "ERITREA",
        "region_name_cn": "厄立特里亚",
        "icao_differences": {
            "en": "Specifies a distinct departure procedure where an aircraft experiencing communication failure should proceed directly to the route specified in the current flight plan if it was flying away from it.",
            "cn": "规定了独特的离场程序，即经历通信故障的飞机若偏离了当前飞行计划航线，应直接飞回该航线。"
        },
        "procedures": [
            {
                "en": "DEPARTURE PROCEDURE. A departing IFR flight flying away from its planned route that experiences communication failure should proceed directly to rejoin the route. If cleared to a level different from the plan, maintain the cleared level, then continue according to the flight plan.",
                "cn": "离场程序。一个正在偏离其计划航线的离场IFR航班，若遭遇通信故障，应直接飞回航线。如果被许可至一个不同于计划的高度层，应保持该许可高度层，然后按飞行计划继续。"
            }
        ]
    },
    "ETHIOPIA": {
        "region_name_en": "ETHIOPIA",
        "region_name_cn": "埃塞俄比亚",
        "icao_differences": {
            "en": "Provides highly specific diversion procedures for Addis Ababa arrivals experiencing communication failure, including detailed tracks and altitudes for diversion to Dire Dawa airport based on aircraft performance.",
            "cn": "为在亚的斯亚贝巴进场时遭遇通信故障的飞机提供了非常具体的备降程序，包括根据飞机性能制定的详细航迹、高度和飞往迪雷达瓦机场的备降航线。"
        },
        "procedures": [
            {
                "en": "ARRIVAL PROCEDURE (ADDIS ABEBA). If unable to land within 30 minutes of EAT/ETA, specific diversion procedures to Dire Dawa airport must be followed, based on aircraft performance (High/Medium).",
                "cn": "进场程序（亚的斯亚贝巴）。如果无法在预计进近/到达时间后30分钟内着陆，必须根据飞机性能（高/中）遵循飞往迪雷达瓦机场的特定备降程序。"
            },
            {
                "en": "High Performance Aircraft: After missed approach, follow a specified track (R-193, then R-188), climb to FL330, and proceed on track 061° to Dire Dawa, then descend to FL150 for a visual landing.",
                "cn": "高性能飞机：复飞后，沿指定航迹（R-193，然后R-188）飞行，爬升至FL330，然后沿061°航迹飞往迪雷达瓦，之后下降至FL150目视着陆。"
            },
            {
                "en": "Medium Performance Aircraft: After missed approach, follow a specified track (R-193, then R-188), cross 'ADS' 40 DME at or above FL155, proceed on track 072°, then 061° to Dire Dawa, and descend to FL150 for a visual landing.",
                "cn": "中性能飞机：复飞后，沿指定航迹（R-193，然后R-188）飞行，在'ADS' 40 DME处以或高于FL155的高度飞越，然后沿072°航向飞行，再转至061°航向飞往迪雷达瓦，之后下降至FL150目视着陆。"
            }
        ]
    },
    "GABON": {
        "region_name_en": "GABON",
        "region_name_cn": "加蓬",
        "icao_differences": {
            "en": "Specifies procedures for Libreville TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了利伯维尔TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "LIBREVILLE TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "利伯维尔TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "GUINEA_BISSAU": {
        "region_name_en": "GUINEA-BISSAU",
        "region_name_cn": "几内亚比绍",
        "icao_differences": {
            "en": "Specifies procedures for Bissau TMA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了比绍TMA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "BISSAU TMA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot, on the current and any other available channel, to acknowledge by performing a specified maneuver or by giving an IDENT instruction.",
                "cn": "比绍TMA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是在当前频道及任何其他可用频道上，要求飞行员通过执行特定机动或发出IDENT指令来确认。"
            }
        ]
    },
    "KENYA": {
        "region_name_en": "KENYA",
        "region_name_cn": "肯尼亚",
        "icao_differences": {
            "en": "Provides a comprehensive set of local procedures, including specific rules for arrivals into Nairobi TMA, detailed missed approach and diversion procedures, and distinct procedures for failures under RLCE or radar clearances, involving a 60° turn to exit controlled airspace.",
            "cn": "提供了一套全面的本地程序，包括进入内罗毕TMA的特定规则，详细的复飞和备降程序，以及在RLCE许可下通信失效的独特程序，涉及以60°转弯脱离受控空域。"
        },
        "procedures": [
            {
                "en": "NAIROBI TMA ARRIVAL. Aircraft will be cleared to the TMA boundary and descended up to FL200. If communication is lost before descent, aircraft from the west should fly to 'GV' VORDME; from the east to 'TV' VORDME.",
                "cn": "内罗毕TMA进场。飞机将被许可至TMA边界并下降至FL200。如果在下降前通信丢失，来自西边的飞机应飞往'GV' VORDME；来自东边的飞机应飞往'TV' VORDME。"
            },
            {
                "en": "LEAVING PROCEDURE (MISSED APPROACH). In Nairobi TMA/CTR, if the alternate is Entebbe, climb on runway heading to FL100+, then intercept 'NV' R-288. If the alternate is Mombasa, turn right, climb to 8500ft to 'TV' VORDME.",
                "cn": "脱离程序（复飞）。在内罗毕TMA/CTR，如果备降机场是恩德培，沿跑道航向爬升至FL100以上，然后截获'NV' R-288。如果备降机场是蒙巴萨，右转爬升至8500英尺飞往'TV' VORDME。"
            },
            {
                "en": "RLCE OR RADAR CLEARANCE FAILURE. After passing the compulsory reporting point of failure, turn 60° left or right to leave controlled airspace, maintaining the last cleared level. Climb to the planned level once clear, then return to controlled airspace and follow normal failure procedures.",
                "cn": "RLCE或许可下雷达通信失效。在经过失效的强制报告点后，向左或右转60°以保持最后许可的高度层离开受控空域。脱离后爬升至计划高度，然后返回受控空域并按正常失效程序飞行。"
            }
        ]
    },
    "MADAGASCAR": {
        "region_name_en": "MADAGASCAR",
        "region_name_cn": "马达加斯加",
        "icao_differences": {
            "en": "Specifies diversion procedures for Antananarivo TMA, including a specific magnetic track to fly in VMC. Also details controller actions for TMA/UTA to verify communication if transponder code 7600 is not set.",
            "cn": "规定了塔那那利佛TMA的备降程序，包括在VMC下飞行的特定磁航迹。同时详细说明了如果应答机未设置7600，TMA/UTA管制员为验证通信而采取的措施。"
        },
        "procedures": [
            {
                "en": "ANTANANARIVO TMA. In IMC, if landing is impossible, aircraft destined for Antananarivo (Ivato) must fly away on a magnetic track of 300 degrees in VMC conditions.",
                "cn": "塔那那利佛TMA。在IMC条件下，如果无法着陆，飞往塔那那利佛（伊瓦图）的飞机必须在VMC条件下沿300度磁航迹飞离。"
            },
            {
                "en": "ANTANANARIVO TMA/UTA. If the pilot does not set transponder to 7600, the controller will attempt to verify receiver functionality by requesting a specified maneuver.",
                "cn": "塔那那利佛TMA/UTA。如果飞行员未将应答机设置为7600，管制员将通过要求执行特定机动来尝试验证接收机功能。"
            }
        ]
    },
    "MALAWI": {
        "region_name_en": "MALAWI",
        "region_name_cn": "马拉维",
        "icao_differences": {
            "en": "Details procedures for RLCE or radar clearances, including a 60° turn to exit controlled airspace. Also provides specific communication procedures for the southern sector of Chileka TMA in case of VHF failure.",
            "cn": "详细说明了RLCE或许可下的雷达程序，包括以60°转弯脱离受控空域。还为奇莱卡TMA南部扇区在VHF故障情况下提供了特定的通信程序。"
        },
        "procedures": [
            {
                "en": "RLCE OR RADAR CLEARANCE FAILURE. After passing the compulsory reporting point of failure, turn 60° left or right to leave controlled airspace, maintaining the last cleared level. Climb to the planned level once clear, then return to controlled airspace and follow normal failure procedures.",
                "cn": "RLCE或许可下雷达通信失效。在经过失效的强制报告点后，向左或右转60°以保持最后许可的高度层离开受控空域。脱离后爬升至计划高度，然后返回受控空域并按正常失效程序飞行。"
            },
            {
                "en": "CHILEKA TMA SOUTHERN SECTOR. Due to high ground, VHF communication may be lost. Aircraft should attempt contact on HF or via relay 10 minutes before entering the TMA if unable to reach Chileka APP or Lilongwe FIC on VHF.",
                "cn": "奇莱卡TMA南部扇区。由于地势较高，VHF通信可能中断。如果在VHF上无法联系到奇莱卡进近或利隆圭飞信中心，飞机应在进入TMA前10分钟尝试通过高频或中继建立联系。"
            }
        ]
    },
    "MALI": {
        "region_name_en": "MALI",
        "region_name_cn": "马里",
        "icao_differences": {
            "en": "Specifies procedures for Bamako TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了巴马科TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "BAMAKO TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot to acknowledge by performing a specified maneuver.",
                "cn": "巴马科TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是要求飞行员通过执行特定机动来确认。"
            }
        ]
    },
    "MAURITANIA": {
        "region_name_en": "MAURITANIA",
        "region_name_cn": "毛里塔尼亚",
        "icao_differences": {
            "en": "Specifies procedures for Nouakchott TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了努瓦克肖特TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "NOUAKCHOTT TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot to acknowledge by performing a specified maneuver.",
                "cn": "努瓦克肖特TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是要求飞行员通过执行特定机动来确认。"
            }
        ]
    },
    "MOROCCO": {
        "region_name_en": "MOROCCO",
        "region_name_cn": "摩洛哥",
        "icao_differences": {
            "en": "Specifies a 7-minute rule for maintaining last assigned speed and level within specific TMAs (Agadir, Casablanca, etc.) following communication failure.",
            "cn": "规定了在特定TMA（如阿加迪尔、卡萨布兰卡等）内通信失效后，保持最后指定速度和高度层7分钟的规则。"
        },
        "procedures": [
            {
                "en": "GENERAL PROCEDURES WITHIN TMA (Agadir, Casablanca, Marrakech, etc.). Set transponder to 7600 and maintain for a period of 7 minutes the last assigned speed and flight level or the Minimum Flight Altitude, whichever is higher.",
                "cn": "TMA内通用程序（阿加迪尔、卡萨布兰卡、马拉喀什等）。将应答机设置为7600，并保持最后分配的速度和飞行高度层或最低飞行高度（以较高者为准）7分钟。"
            }
        ]
    },
    "NAMIBIA": {
        "region_name_en": "NAMIBIA",
        "region_name_cn": "纳米比亚",
        "icao_differences": {
            "en": "Provides a specific visual arrival procedure for several airports in case of communication failure, requiring an overhead join at a specified altitude above ground level.",
            "cn": "为几个机场提供了通信失效时的特定目视进场程序，要求在机场上空特定离地高度加入交通航线。"
        },
        "procedures": [
            {
                "en": "ARRIVAL PROCEDURE FOR KATIMA MULILO, KEETMANSHOOP, LUDERITZ, ONDANGWA, AND WALVIS BAY. Join overhead the aerodrome at 2000ft AGL (2500ft AGL at Luderitz), observe and join the traffic pattern, land as soon as possible, and report to the ATC unit.",
                "cn": "卡蒂马姆利洛、基特曼斯胡普、吕德里茨、翁丹瓜和鲸湾港的进场程序。在机场上空2000英尺AGL（吕德里茨为2500英尺AGL）加入，观察并加入机场交通航线，尽快着陆并向ATC单位报告。"
            }
        ]
    },
    "NIGER": {
        "region_name_en": "NIGER",
        "region_name_cn": "尼日尔",
        "icao_differences": {
            "en": "Specifies procedures for Niamey TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了尼亚美TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "NIAMEY TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot to acknowledge by performing a specified maneuver.",
                "cn": "尼亚美TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是要求飞行员通过执行特定机动来确认。"
            }
        ]
    },
    "NIGERIA": {
        "region_name_en": "NIGERIA",
        "region_name_cn": "尼日利亚",
        "icao_differences": {
            "en": "Details a comprehensive set of local procedures, including specific descent timing rules and what to do if an EAT has not been received.",
            "cn": "详细规定了一套全面的本地程序，适用于不同飞行阶段，包括具体的下降时机规则以及在未收到预计进近时间（EAT）时应采取的措施。"
        },
        "procedures": [
            {
                "en": "BASIC PROCEDURE. Commence descent at the last acknowledged EAT, or at the computed ETA if no EAT was received. A descent may only be commenced within 10 minutes following this time. If 'Delay not Determined' has been given and no subsequent EAT was issued, do not attempt to land at the destination but proceed to an alternate.",
                "cn": "基本程序。在最后确认的EAT，或者如果未收到EAT，则在计算出的ETA开始下降。只能在该时间之后的10分钟内开始下降。如果已收到“延误未定”且后续未发布EAT，则不要尝试在目的地机场着陆，应飞往备降机场。"
            }
        ]
    },
    "SENEGAL": {
        "region_name_en": "SENEGAL",
        "region_name_cn": "塞内加尔",
        "icao_differences": {
            "en": "Specifies procedures for Dakar TMA/UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了达喀尔TMA/UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "DAKAR TMA/UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot to acknowledge by performing a specified maneuver.",
                "cn": "达喀尔TMA/UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是要求飞行员通过执行特定机动来确认。"
            }
        ]
    },
    "SEYCHELLES": {
        "region_name_en": "SEYCHELLES",
        "region_name_cn": "塞舌尔",
        "icao_differences": {
            "en": "Specifies a 20-minute rule for maintaining level after failing to report over a compulsory reporting point. Provides detailed VFR and specific airport (Praslin) procedures for communication failure.",
            "cn": "规定了在强制报告点报告失败后保持高度层20分钟的规则。为通信失效提供了详细的VFR程序和特定机场（普拉兰）的程序。"
        },
        "procedures": [
            {
                "en": "FIR/TMA PROCEDURE. Maintain last assigned speed and level for 20 minutes following a failure to report over a compulsory reporting point, then adjust according to the filed flight plan.",
                "cn": "FIR/TMA程序。在强制报告点报告失败后，保持最后分配的速度和高度层20分钟，然后根据已提交的飞行计划进行调整。"
            },
            {
                "en": "PRASLIN AIRPORT. If contact is not established, proceed overhead the 'PRA' DVOR not below 2500ft QNH, join the traffic pattern, and land if possible within 15 minutes of the last acknowledged ETA.",
                "cn": "普拉兰机场。如果未建立联系，飞越'PRA' DVOR上空，高度不低于2500英尺QNH，加入交通航线，并尽可能在最后确认的预计到达时间后15分钟内着陆。"
            }
        ]
    },
    "SOMALIA": {
        "region_name_en": "SOMALIA",
        "region_name_cn": "索马里",
        "icao_differences": {
            "en": "Provides alternative communication procedures via SATCOM in case of HF radio communication failure.",
            "cn": "提供了在高频无线电通信失效时，通过卫星电话（SATCOM）进行通信的备用程序。"
        },
        "procedures": [
            {
                "en": "In case of HF radio communication failure in Mogadishu FIR, pilots are requested to contact Mogadishu FIC on SATCOM or designated telephone lines.",
                "cn": "在摩加迪沙飞行情报区内若发生高频无线电通信故障，请飞行员通过卫星电话（SATCOM）或指定的电话线路联系摩加迪沙飞信中心。"
            }
        ]
    },
    "SOUTH_AFRICAN_REP": {
        "region_name_en": "SOUTH AFRICAN REP.",
        "region_name_cn": "南非共和国",
        "icao_differences": {
            "en": "Details specific VFR arrival procedures for communication failure, including joining overhead the aerodrome at 1000ft above circuit altitude. Provides alternative communication via SATCOM for Johannesburg Oceanic FIR.",
            "cn": "详细规定了通信失效时的特定VFR进场程序，包括在航线高度以上1000英尺处从机场上空加入。还为约翰内斯堡海洋飞行情报区提供了通过卫星电话的备用通信方式。"
        },
        "procedures": [
            {
                "en": "VFR ARRIVALS. Squawk 7600, make blind broadcasts, turn on landing lights, and join overhead the aerodrome at 1000ft above circuit altitude to determine the active runway. Conform to the circuit pattern, land, and inform ATC.",
                "cn": "VFR进场。设置应答机7600，进行盲发广播，打开着陆灯，在机场航线高度以上1000英尺处加入以确定活动跑道。遵守航线模式，着陆并通知ATC。"
            },
            {
                "en": "JOHANNESBURG OCEANIC FIR (FAJO). In case of HF system failure, maintain the last assigned flight level until clear of the area, unless a level change is approved via alternate communication sources (Luanda FIC or Springbok JNB relay).",
                "cn": "约翰内斯堡海洋FIR（FAJO）。如果HF系统故障，保持最后分配的飞行高度层直至飞离该区域，除非通过备用通信源（罗安达FIC或斯普林博克JNB中继）批准了高度更改。"
            },
            {
                "en": "EMERGENCY SATELLITE VOICE CALLS. If all other means of communication have failed, dedicated satellite voice telephone numbers are available, such as Johannesburg Oceanic at +27 11 928 6456.",
                "cn": "紧急卫星语音通话。如果所有其他通信方式都失效，可以使用专用的卫星语音电话号码，例如约翰内斯堡海洋区电话 +27 11 928 6456。"
            }
        ]
    },
    "SUDAN": {
        "region_name_en": "SUDAN",
        "region_name_cn": "苏丹",
        "icao_differences": {
            "en": "Specifies a procedure to leave controlled airspace by turning 60 degrees left or right after passing a compulsory reporting point where contact with ATC was lost.",
            "cn": "规定了在与ATC失去联系的强制报告点后，通过向左或向右转60度来脱离受控空域的程序。"
        },
        "procedures": [
            {
                "en": "BASIC PROCEDURE. After passing the compulsory reporting point where contact was lost, turn 60 degrees left or right to leave controlled airspace at the last acknowledged level. Once clear, climb to the planned level, then return to controlled airspace and proceed with normal radio failure procedures.",
                "cn": "基本程序。在经过失去联系的强制报告点后，向左或向右转60度，以最后确认的高度层离开受控空域。脱离后，爬升至计划高度层，然后返回受控空域并按正常的无线电故障程序继续飞行。"
            }
        ]
    },
    "TOGO": {
        "region_name_en": "TOGO",
        "region_name_cn": "多哥",
        "icao_differences": {
            "en": "Specifies procedures for Lome UTA, including setting transponder to 7600 and controller actions to verify communication by requesting specific maneuvers.",
            "cn": "规定了洛美UTA的程序，包括将应答机设置为7600以及管制员通过要求特定机动来验证通信的措施。"
        },
        "procedures": [
            {
                "en": "LOME UTA. In the event of a two-way communication interruption, the pilot shall set the transponder to Code 7600. If the pilot fails to do so, the controller will attempt to verify if the on-board receiver is working by requesting the pilot to acknowledge by performing a specified maneuver.",
                "cn": "洛美UTA。如果双向通信中断，飞行员应将应答机设置为7600代码。如果飞行员未执行此操作，管制员将尝试验证机载接收机是否正常工作，方法是要求飞行员通过执行特定机动来确认。"
            }
        ]
    },
    "UGANDA": {
        "region_name_en": "UGANDA",
        "region_name_cn": "乌干达",
        "icao_differences": {
            "en": "Details a comprehensive set of local procedures, including a specific leaving procedure for missed approaches with defined altitudes for different performance aircraft, and a distinct procedure for failures under RLCE clearances involving a 60° turn.",
            "cn": "详细说明了一套全面的本地程序，包括针对不同性能飞机的复飞离场程序，规定了明确的高度，以及在RLCE许可下通信失效的独特程序，涉及60°转弯。"
        },
        "procedures": [
            {
                "en": "LEAVING PROCEDURE (MISSED APPROACH). Leave controlled airspace on the prescribed missed approach track and proceed to the alternate, climbing to a level appropriate for the aircraft's performance (e.g., Low: FL90/100, Medium: FL160/170, High: FL290/300).",
                "cn": "脱离程序（复飞）。沿规定的复飞航迹离开受控空域并飞往备降场，爬升至与飞机性能相应的飞行高度层（例如，低性能：FL90/100，中性能：FL160/170，高性能：FL290/300）。"
            },
            {
                "en": "RLCE CLEARANCE FAILURE. After passing the compulsory reporting point of failure, turn 60° left or right to leave controlled airspace, maintaining the last cleared level. Climb to the planned level once clear, then return to controlled airspace.",
                "cn": "RLCE许可下通信失效。在经过失效的强制报告点后，向左或右转60°以保持最后许可的高度层离开受控空域。脱离后爬升至计划高度，然后返回受控空域。"
            }
        ]
    }
};

// 导出模块
module.exports = {
    ICAO_DIFFERENCES_COMM_FAILURE_AFRICA_MERGED
};