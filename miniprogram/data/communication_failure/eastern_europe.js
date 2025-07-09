/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - EASTERN EUROPE
 *
 * @remarks
 * This data is extracted from the EASTERN EUROPE AIRWAY MANUAL for reference only.
 * Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource eawm_eastern_europe.pdf
 *
 * @version 2.1.0
 * @date 2025-07-08
 */
const ICAO_DIFFERENCES_COMM_FAILURE_EASTERN_EUROPE = {
    "ARMENIA": {
        "region_name_en": "ARMENIA",
        "region_name_cn": "亚美尼亚",
        "icao_differences": {
            "en": "In case of one-way communication failure, continuously monitor LOM/LMM of the landing aerodrome or Yerevan VORDME 'ZVR' for instructions.",
            "cn": "单向通信失效时，需持续监听着陆机场的LOM/LMM或埃里温VORDME 'ZVR'频率以获取指令。"
        },
        "procedures": [
            {
                "en": "In general, the Emergency, Unlawful Interference, Communications Failure, Interception and Search and Rescue procedures are in conformity with the Standards, Recommended Practices and Procedures in ICAO Annexes and Documents.",
                "cn": "总则上，紧急情况、非法干扰、通信失效、拦截以及搜索和救援程序符合ICAO附件和文件中的标准、建议措施和程序。"
            },
            {
                "en": "ONE-WAY COMMUNICATION FAILURE. If the aircraft’s radio is completely unserviceable, the aircraft crew should receive the required information on the flight and instructions of the ATC units by continuously monitoring LOM and/or LMM frequencies of the landing aerodrome, or for enroute flights, VORDME frequency of the airport Yerevan (Zvartnots).",
                "cn": "单向通信失效。如果航空器无线电完全无法使用，机组应通过持续监控着陆机场的LOM和/或LMM频率，或对于航路飞行，监控埃里温（兹瓦尔特诺茨）机场的VORDME频率，来接收所需的飞行信息和ATC单位的指令。"
            }
        ]
    },
    "BELARUS": {
        "region_name_en": "BELARUS",
        "region_name_cn": "白俄罗斯",
        "icao_differences": {
            "en": "Provides specific procedures for individual airports (e.g., Brest), including holding over specified NAVAIDs, descending to specific altitudes, and maintaining level for 3 minutes if being radar vectored.",
            "cn": "为特定机场（如布列斯特）提供了具体程序，包括在指定导航设备上空等待、下降至特定高度，以及在接受雷达引导时保持高度层3分钟。"
        },
        "procedures": [
            {
                "en": "In case of two-way radio communication failure within ТМА the pilot-in-command shall: send emergency signal (MAYDAY) and set transponder, if available, to mode A, code 7600; take measures to restore communication with the ATS unit via other aircraft or other ATS units; use emergency frequency 121.500MHz; transmit information about the taken decision, location, flight altitude using emergency signal (PAN PAN) without acknowledgement of its acceptance by the ATS unit; monitor the instructions and information of the ATS units via the communication channels and on Brest VORDME ‘BRT’ frequency of the landing aerodrome; call the Supervisor (Tower, FIS): +375 162 972213; +375 162 972204, if possible.",
                "cn": "在终端管制区（ТМА）内发生双向无线电通信故障时，机长应：发送紧急信号（MAYDAY）并在有条件时将应答机设置为A模式，代码7600；采取措施通过其他飞机或其他空中交通服务（ATS）单位恢复与ATS单位的通信；使用紧急频率121.500MHz；使用紧急信号（PAN PAN）广播所做决定、位置、飞行高度等信息，无需等待ATS单位的确认；通过通信频道和目的地机场的布列斯特VORDME‘BRT’频率监控ATS单位的指令和信息；如有可能，呼叫主管（塔台，飞行情报服务）：+375 162 972213; +375 162 972204。"
            },
            {
                "en": "In VMC: set transponder to mode A, code 7600; continue to operate in VMC; carry out landing at the nearest suitable aerodrome; report the time of arrival to the appropriate ATS unit using the aids of the fastest transmission of information.",
                "cn": "在目视气象条件（VMC）下：将应答机设置为A模式，代码7600；继续在VMC下飞行；在最近的合适机场降落；使用最快的传输方式向相应的ATS单位报告到达时间。"
            },
            {
                "en": "In IMC, if there is no possibility to operate flight in VMC: on arrival: maintain last assigned and acknowledged altitude/flight level; set transponder to code 7600; proceed to ‘BRT’; hold over ‘BRT’, descend to 4000ft initial approach altitude and carry out an approach procedure.",
                "cn": "在仪表气象条件（IMC）下，如果无法在VMC下飞行：进场时：保持最后分配并确认的高度/飞行高度；将应答机设置为7600；飞往‘BRT’；在‘BRT’上空等待，下降至4000英尺初始进近高度并执行进近程序。"
            },
            {
                "en": "on departure: when SID has been assigned and acknowledged by the crew: set transponder to code 7600; continue assigned and acknowledged SID; after reaching the last assigned flight level continue further climb to the flight level as indicated in the flight plan within 3 minutes. if being radar vectored: set transponder to code 7600; continue on assigned heading and flight level for 3 minutes, then proceed to SID final point climbing to the flight level as indicated in the flight plan.",
                "cn": "离场时：如果已分配并由机组确认了标准仪表离场（SID）程序：将应答机设置为7600；继续执行已分配并确认的SID；到达最后分配的飞行高度后，在3分钟内继续爬升至飞行计划中指定的高度。如果正在接受雷达引导：将应答机设置为7600；保持分配的航向和飞行高度飞行3分钟，然后飞往SID终点，爬升至飞行计划中指定的高度。"
            }
        ]
    },
    "BULGARIA": {
        "region_name_en": "BULGARIA",
        "region_name_cn": "保加利亚",
        "icao_differences": {
            "en": "Specifies a procedure for Plovdiv Airport: proceed to VORDME 'PDV' or LCTR 'PD' at 7000ft, hold for a minimum of 7 minutes, then execute an approach.",
            "cn": "规定了普罗夫迪夫机场的程序：飞往VORDME 'PDV'或LCTR 'PD'，高度7000英尺，等待至少7分钟，然后执行进近程序。"
        },
        "procedures": [
            {
                "en": "Arrival Procedure: Set transponder to Code 7600. If approach clearance has been given and acknowledged, continue flight in accordance with the cleared procedure. If approach clearance has not been given, proceed to VORDME ‘PDV’ or LCTR ‘PD’ at 7000ft, hold for a minimum of 7 minutes, and then execute an approach procedure at your discretion.",
                "cn": "进场程序：将应答机设置为7600。如已收到并确认进近许可，则按许可程序继续飞行。如未收到进近许可，飞往VORDME ‘PDV’或LCTR ‘PD’，高度7000英尺，等待至少7分钟，然后自行决定执行进近程序。"
            },
            {
                "en": "Departure Procedure: Set transponder to Code 7600. Maintain the last assigned level for 2 minutes, then climb to the cruising level as stated in the current flight plan.",
                "cn": "离场程序：将应答机设置为7600。保持最后分配的高度2分钟，然后爬升至当前飞行计划中规定的巡航高度。"
            }
        ]
    },
    "CZECHIA": {
        "region_name_en": "CZECHIA",
        "region_name_cn": "捷克",
        "icao_differences": {
            "en": "Specifies designated NAVAIDs for various airports (e.g., VOR 'BNO' for Brno) and a 7-minute period of maintaining last assigned speed/level in IMC.",
            "cn": "规定了在通信失效情况下各机场应使用的指定导航设备（如为布尔诺指定的VOR 'BNO'），以及在IMC下需保持最后分配速度/高度7分钟。"
        },
        "procedures": [
            {
                "en": "VISUAL METEOROLOGICAL CONDITIONS (VMC): set transponder to Code 7600, continue to fly in VMC, land at the nearest suitable aerodrome and report its arrival by the most expeditious means to the appropriate air traffic service unit; if considered advisable, complete an IFR flight in accordance with INSTRUMENTAL METEOROLOGICAL CONDITIONS (IMC).",
                "cn": "目视气象条件（VMC）：设置应答机代码为7600，继续在VMC下飞行，在最近的合适机场着陆，并以最快捷的方式向适当的空中交通服务单位报告到达；如果认为可取，则按照仪表气象条件（IMC）完成IFR飞行。"
            },
            {
                "en": "INSTRUMENTAL METEOROLOGICAL CONDITIONS (IMC): If a controlled IFR flight flying with communication failure in IMC or when it is inadvisable to continue the flight in accordance with VMC, the aircraft shall: set the transponder to Code 7600; maintain the last assigned speed and level or minimum flight altitude if higher, for a period of 7 minutes.",
                "cn": "仪表气象条件（IMC）：如果受控IFR航班在IMC下飞行时通信失效，或在不宜按VMC继续飞行的情况下，航空器应：设置应答机代码为7600；保持最后分配的速度和高度，或最低飞行高度（如果更高），持续7分钟。"
            },
            {
                "en": "DESIGNATED NAVIGATIONAL AIDS: Brno (Turany) VOR ‘BNO’, Caslav NDB ‘CF’, Karlovy Vary Lctr ‘L’, Kunovice NDB ‘KNE’, Namest NDB ‘LA’, Ostrava (Mosnov) VORDME ‘OTA’, Pardubice NDB ‘PK’, Prague (Ruzyne) VORDME ‘OKL’, Prague (Vodochody) Lctr ‘V’",
                "cn": "指定导航设备：布尔诺（图拉尼）VOR‘BNO’，查斯拉夫NDB‘CF’，卡罗维发利定位信标‘L’，库诺维采NDB‘KNE’，纳梅斯特NDB‘LA’，俄斯特拉发（莫什诺夫）VORDME‘OTA’，帕尔杜比采NDB‘PK’，布拉格（鲁济涅）VORDME‘OKL’，布拉格（沃多霍迪）定位信标‘V’"
            }
        ]
    },
    "ESTONIA": {
        "region_name_en": "ESTONIA",
        "region_name_cn": "爱沙尼亚",
        "icao_differences": {
            "en": "Specifies detailed procedures for Tallinn Airport, including proceeding to waypoints VEMOX (RWY 08) or MOKEX (RWY 26) and commencing descent in the holding pattern.",
            "cn": "规定了塔林机场的详细程序，包括飞往航路点VEMOX（跑道08）或MOKEX（跑道26），并在等待航线中开始下降。"
        },
        "procedures": [
            {
                "en": "TALLINN (LENNART MERI) AIRPORT. Aircraft having phone on board, call: Operational Supervisor Tel: +372 625 8254 and if possible stay on line until instructed by ATC.",
                "cn": "塔林（伦纳特·梅里）机场。机上配有电话的飞机，请致电：运行主管，电话：+372 625 8254，如有可能，请保持通话直到收到空管指令。"
            },
            {
                "en": "Arrival Procedure. Inbound Clearance received and acknowledged: Squawk Mode A, code 7600. If clearance limit is runway-in-use, maintain last acknowledged level, follow route to VEMOX (RWY 08) or MOKEX (RWY 26), and proceed as per item f). If clearance limit is other than runway-in-use, maintain last acknowledged level, proceed to limit then direct to VEMOX or MOKEX, then follow item f). If EAT received, hold at clearance limit, leave at EAT, then follow item f). If on radar approach, maintain last level, proceed direct to VEMOX or MOKEX, then follow item f). At VEMOX or MOKEX, descend in holding pattern and complete normal instrument approach.",
                "cn": "进场程序。收到并确认进场许可后：应答机设为A模式，7600。若许可限制为使用跑道，保持最后确认的高度，沿航路飞至VEMOX（08跑道）或MOKEX（26跑道），然后按f)项执行。若许可限制非使用跑道，保持最后确认的高度，飞至限制点后直飞VEMOX或MOKEX，然后按f)项执行。若收到预计进近时间（EAT），在许可限制点等待，于EAT离开，然后按f)项执行。若在雷达引导下进近，保持最后高度，直飞VEMOX或MOKEX，然后按f)项执行。在VEMOX或MOKEX，在等待航线中下降并完成正常仪表进近。"
            },
            {
                "en": "No Inbound Clearance received and/or acknowledged: Squawk Mode A, code 7600. Maintain the last received and acknowledged level, then proceed via the relevant TMA entry point; and direct to VEMOX (RWY 08) or MOKEX (RWY26). At VEMOX (RWY 08) or MOKEX (RWY 26) commence descent, if required, in the holding pattern, thereafter complete a normal instrument approach procedure.",
                "cn": "未收到和/或确认进场许可：应答机设为A模式，7600。保持最后收到并确认的高度，然后经由相关TMA进入点，直飞VEMOX（08跑道）或MOKEX（26跑道）。在VEMOX（08跑道）或MOKEX（26跑道），如有必要，在等待航线中开始下降，此后完成正常的仪表进近程序。"
            }
        ]
    },
    "GEORGIA": {
        "region_name_en": "GEORGIA",
        "region_name_cn": "格鲁吉亚",
        "icao_differences": {
            "en": "In IMC, maintain the last assigned speed and level for 7 minutes, then rejoin the flight plan route.",
            "cn": "在仪表气象条件下，保持最后指定的速度和高度7分钟，然后重新加入飞行计划航线。"
        },
        "procedures": [
            {
                "en": "VISUAL METEOROLOGICAL CONDITIONS (VMC). A controlled flight experiencing communication failure in VMC shall: set transponder to Code 7600; continue to fly in VMC; land at the nearest suitable aerodrome; and report its arrival time by the most expeditious means to the appropriate ATS unit.",
                "cn": "目视气象条件（VMC）。在VMC下经历通信故障的受控航班应：将应答机设置为7600代码；继续在VMC下飞行；在最近的合适机场降落；并以最快捷的方式向相应的空中交通服务单位报告其到达时间。"
            },
            {
                "en": "INSTRUMENT METEOROLOGICAL CONDITIONS (IMC). A controlled IFR flight experiencing communication failure in IMC shall: set transponder to Code 7600; maintain for a period of 7 minutes the last assigned speed and level or the minimum flight altitude, if higher.",
                "cn": "仪表气象条件（IMC）。在IMC下经历通信故障的受控IFR航班应：将应答机设置为7600代码；保持最后分配的速度和高度，或最低飞行高度（如果更高），持续7分钟。"
            }
        ]
    },
    "KAZAKHSTAN": {
        "region_name_en": "KAZAKHSTAN",
        "region_name_cn": "哈萨克斯坦",
        "icao_differences": {
            "en": "In case of radio communication failure after take-off, the aircraft must return to land at the departure aerodrome. If unable to land, proceed to the alternate.",
            "cn": "起飞后通信失效，飞机必须返回起飞机场着陆。如果无法着陆，则飞往备降机场。"
        },
        "procedures": [
            {
                "en": "In case of radio communication failure after take-off, continue flight according to current flight plan and land at the departure aerodrome. In this case, it is allowed to land in meteorological conditions below the operating aerodrome minimum. If a landing to an arriving aerodrome is impossible after balked landing or missed approach, proceed to the alternate aerodrome according to the SID schemes climbing to the lowest safe flight level. Alternatively proceed to the alternate aerodrome to backward direction of flight path the return flight shall be carried out at the nearest opposite lower flight level stated in the flight plan or to the alternate aerodrome in the direction of flight path on the flight level stated in the flight plan.",
                "cn": "起飞后如遇无线电通信故障，应按当前飞行计划继续飞行并在起飞机场着陆。在此情况下，允许在低于机场运行最低标准的气象条件下着陆。如果返场着陆或复飞后无法在到达机场着陆，应按照标准仪表离场（SID）程序爬升至最低安全飞行高度，飞往备降机场。或者，飞往航路后方的备降机场，返航应在飞行计划中规定的最近的相反方向的较低飞行高度层进行；或飞往航路前方的备降机场，按飞行计划中规定的飞行高度层飞行。"
            }
        ]
    },
    "MONGOLIA": {
        "region_name_en": "MONGOLIA",
        "region_name_cn": "蒙古",
        "icao_differences": {
            "en": "If being radar vectored, proceed directly from the point of failure to the fix, aid, or route specified in the vector clearance.",
            "cn": "如果正在接受雷达引导，则从无线电故障点直接飞往引导许可中指定的定位点、导航设备或航线。"
        },
        "procedures": [
            {
                "en": "The pilot-in-command shall, following a two-way radio communications failure when operating under IFR in IMC flight conditions, continue the flight along the following routes: along the route assigned in the last ATC clearance received; if being radar vectored, along direct route from the point of radio failure to the fix, aid, or route specified in the vector clearance; in the absence of an assigned route, along the route as expected to be assigned by ATC in a further clearance; in the absence of an assigned route or a route expected to be assigned by ATC in a further clearance, along the route filed in the flight plan.",
                "cn": "机长在仪表气象条件下（IMC）进行仪表飞行规则（IFR）飞行时，如遇双向无线电通信故障，应沿以下航路继续飞行：沿最后收到的空中交通管制（ATC）许可中指定的航路飞行；如果正在接受雷达引导，则从无线电故障点沿直线飞往引导许可中指定的修正点、导航设备或航路；如果没有指定的航路，则沿ATC在后续许可中预计会指定的航路飞行；如果没有指定的航路，也没有ATC在后续许可中预计会指定的航路，则沿飞行计划中提交的航路飞行。"
            }
        ]
    },
    "POLAND": {
        "region_name_en": "POLAND",
        "region_name_cn": "波兰",
        "icao_differences": {
            "en": "Specific procedures for Powidz Airport (EPPW). After setting code 7600, continue on the assigned heading and altitude for 2 minutes before proceeding to the IAF.",
            "cn": "波维兹机场（EPPW）有特定程序。设置7600代码后，继续沿指定航向和高度飞行2分钟，然后再飞往初始进近点（IAF）。"
        },
        "procedures": [
            {
                "en": "POWIDZ AIRPORT (EPPW) Arrival Procedure: In the case of communications failure during an IFR flight conducted within Powidz MTMA, the pilot shall: set the transponder to code 7600; for 2 minutes after setting the 7600 code, continue flight on the assigned heading and at the last assigned and confirmed altitude; without changing the altitude, fly along the shortest route to the IAF of the IAP specified previously by ATC.",
                "cn": "波维兹机场（EPPW）进场程序。在波维兹军事终端管制区（MTMA）内进行的IFR飞行中发生通信故障时，飞行员应：将应答机设置为7600代码；设置7600代码后，保持分配的航向和最后分配并确认的高度继续飞行2分钟；不改变高度，沿最短航线飞往ATC先前指定的仪表进近程序（IAP）的初始进近定位点（IAF）。"
            }
        ]
    },
    "RUSSIA": {
        "region_name_en": "RUSSIA",
        "region_name_cn": "俄罗斯",
        "icao_differences": {
            "en": "If unable to land at the departure aerodrome after comms failure, proceed to destination or alternate at the assigned level or a proximate lower/upper level.",
            "cn": "通信失效后若无法在起飞机场着陆，则按分配的高度层或就近的较低/较高高度层飞往目的地或备降机场。"
        },
        "procedures": [
            {
                "en": "In case of radio communication failure after take-off, the pilot must carry out the approach according to the established approach procedure at the departure aerodrome. If unable to land at the departure aerodrome after take-off (due to meteorological conditions or of the aircraft mass exceeds the landing mass and fuel jettisoning is impossible, etc.), the pilot has the right to: proceed to the destination aerodrome according to conditions assigned by ATS unit; proceed to the alternate aerodrome at the flight level assigned by the ATS unit or at proximate lower level (in accordance with vertical separation rules), but not below the lower safe level. If the flight is carried out at the lower safe level, it is necessary to proceed to the alternate aerodrome at proximate upper level.",
                "cn": "起飞后无线电通信失效时，飞行员必须按照既定的进近程序在起飞机场进近。如果因气象条件或飞机质量超过着陆质量且无法抛油等原因无法在起飞机场着陆，飞行员有权：根据空中交通服务单位分配的条件飞往目的地机场；或按空中交通服务单位分配的高度层或就近的较低高度层（符合垂直间隔规定），但不得低于最低安全高度，飞往备降机场。如果飞行在最低安全高度层进行，则必须飞往就近的较高高度层的备降机场。"
            }
        ]
    },
    "SLOVAKIA": {
        "region_name_en": "SLOVAKIA",
        "region_name_cn": "斯洛伐克",
        "icao_differences": {
            "en": "Specifies designated NAVAIDs for various airports to be used in case of communication failure, such as NDB 'OB' for Bratislava and VOR 'KSC' for Kosice.",
            "cn": "规定了在通信失效情况下应使用的各机场指定导航设备，例如为布拉迪斯拉发指定的NDB 'OB'和为科希策指定的VOR 'KSC'。"
        },
        "procedures": [
            {
                "en": "DESIGNATED NAVIGATIONAL AIDS: The following radio navigational aids or holding fixes have been designated for aircraft experiencing radio communication failure in IMC: Bratislava (M.R. Stefanik) NDB ‘OB’ (for RWY 31) NDB ‘OKR’ (for RWY 22); Kosice VOR ‘KSC’; Piestany NDB ‘PNY’; Poprad (Tatry) ABRAG;Zilina NDB ‘ZLA’ or SAGAN.",
                "cn": "指定导航设备：以下无线电导航设备或等待点已被指定用于在IMC中遇到无线电通信故障的飞机：布拉迪斯拉发（M.R.什特凡尼克）NDB 'OB'（用于跑道31），NDB 'OKR'（用于跑道22）；科希策 VOR 'KSC'；皮耶什佳尼 NDB 'PNY'；波普拉德（塔特拉）ABRAG；日利纳 NDB 'ZLA'或SAGAN。"
            }
        ]
    },
    "TAJIKISTAN": {
        "region_name_en": "TAJIKISTAN",
        "region_name_cn": "塔吉克斯坦",
        "icao_differences": {
            "en": "Provides detailed procedures for Bokhtar Airport, including attempts to restore communication, using visual signals, and landing below minimums if necessary.",
            "cn": "提供了博赫塔尔机场的详细程序，包括尝试恢复通信、使用目视信号，以及必要时在低于最低标准的条件下着陆。"
        },
        "procedures": [
            {
                "en": "Bokhtar Airport: In case of radio communication failure in Bokhtar TMA proceed as follows: take measures to restore the radio communication with the controller using all facilities and communication channels (VHF, HF, ADF and other aircraft and aerodromes); switch on the distress signal; at night switch on the landing lights at regular intervals, if communication fails; continue to transmit the established reports about aircraft position, flight altitude and own actions using urgency signal without controller’s confirmation; assess meteorological conditions and the possibility to change to VFR flight and make a decision to continue or finish the flight; if unable to change to VFR flight, proceed to destination aerodrome according to IFR at assigned flight level (obtained before radio communication failure); after passing LOM, carry out approach procedure leaving the holding area and land; when executing approach procedure, on final turn or after passing LOM, aircraft shall identify itself and request landing by means of flashing and then by switching on landing lights and by signal flares of any color; If the weather conditions at the aerodrome have fallen below the minimum, the pilot can decide to land under current conditions.",
                "cn": "博赫塔尔机场：在博赫塔尔终端管制区（TMA）内发生无线电通信故障时，请按以下步骤操作：采取措施，使用所有可用设备和通信渠道（VHF、HF、ADF以及其他飞机和机场）与管制员恢复无线电通信；开启遇险信号；夜间通信故障时，定期开启着陆灯；继续使用紧急信号发送有关飞机位置、飞行高度和自身行动的既定报告，无需管制员确认；评估气象条件以及转为目视飞行规则（VFR）飞行的可能性，并决定是继续还是终止飞行；如果无法转为VFR飞行，则按仪表飞行规则（IFR）在指定的飞行高度（通信故障前获得）飞往目的地机场；飞越低空外信标（LOM）后，执行进近程序，脱离等待航线并着陆；在执行进近程序时，在最后转弯或飞越LOM后，飞机应通过闪烁然后开启着陆灯以及使用任何颜色的信号弹来表明身份并请求着陆；如果机场天气条件低于最低标准，飞行员可决定在当前条件下着陆。"
            }
        ]
    },
    "TURKMENISTAN": {
        "region_name_en": "TURKMENISTAN",
        "region_name_cn": "土库曼斯坦",
        "icao_differences": {
            "en": "For in-flight contingencies requiring a level change, turn 30° right to offset from the airway, then resume course at the new level.",
            "cn": "对于需要改变高度的飞行中应急情况，向右转30°以偏离航路，然后在新的高度层恢复航向。"
        },
        "procedures": [
            {
                "en": "When encountering hazards to flight safety at the assigned altitude (flight level) (dangerous meteorological phenomena, failures of equipment, etc.), the pilot shall have the right to change the altitude (flight level) independently with immediate reporting to the appropriate ATC unit. In this case, the pilot shall, without changing altitude (flight level), turn away, to the right 30 degrees from the airway or the flight route, report it to ATC and on passing 10.8NM (20km) from the airway centerline or the flight route, resume the former flight course with simultaneous change of altitude to the selected altitude (flight level). In emergency, the descent shall be carried out immediately after turning away. Upon reaching the new flight level the pilot shall, after receiving clearance from the ATC unit, enter the airway.",
                "cn": "在指定高度（飞行高度层）遇到危及飞行安全的危险情况（如危险气象现象、设备故障等）时，飞行员有权自主改变高度（飞行高度层），并立即向相关空中交通管制单位报告。在这种情况下，飞行员应在不改变高度（飞行高度层）的情况下，从航路或航线中心线向右偏航30度，向空管报告，并在偏离航路中心线10.8海里（20公里）后，恢复原航向，同时改变高度至选定的高度（飞行高度层）。在紧急情况下，应在偏航后立即开始下降。到达新的飞行高度后，飞行员应在收到空中交通管制单位的许可后，重新进入航路。"
            }
        ]
    },
    "UZBEKISTAN": {
        "region_name_en": "UZBEKISTAN",
        "region_name_cn": "乌兹别克斯坦",
        "icao_differences": {
            "en": "Specifies different time periods for maintaining the last assigned speed and level depending on the airspace: 20 minutes for procedural separation and 7 minutes for ATS surveillance.",
            "cn": "根据空域类型规定了不同的保持最后分配速度和高度的时长：程序间隔为空域20分钟，ATS监视空域为7分钟。"
        },
        "procedures": [
            {
                "en": "In the event of radio communication failure while in compliance with VFR procedure, an aircraft shall proceed in accordance with the flight plan to the first landing aerodrome. If impossible, the aircraft shall fly to the alternate aerodrome (departure aerodrome) where the weather conditions make it possible to land under VFR.",
                "cn": "在遵守VFR程序期间发生无线电通信故障时，飞机应按照飞行计划飞往第一个着陆机场。如果无法实现，飞机应飞往备降机场（起飞机场），那里的天气条件允许在VFR下着陆。"
            },
            {
                "en": "In case of radio communication failure while IFR flight performing and transition from IFR to VFR is not possible, the aircraft: in airspace where procedural separation is being applied, maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 20 minutes following the aircraft’s failure to report its position over a compulsory reporting point and thereafter adjust level and speed in accordance with the filed flight plan; in airspace where an ATS surveillance system is used in the provision of air traffic control, maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 7 minutes following: the time the last assigned level or minimum flight altitude is reached, or the time the transponder is set to Code 7600, or the aircraft’s failure to report its position over a compulsory reporting point, whichever is later and thereafter adjust level and speed in accordance with the filed flight plan.",
                "cn": "在执行IFR飞行期间发生无线电通信故障且无法转为VFR飞行时，航空器：在实施程序间隔的空域内，在航空器未能报告其在强制报告点的位置后，保持最后分配的速度和高度或最低飞行高度（如果更高），持续20分钟，然后根据已提交的飞行计划调整高度和速度；在提供空中交通管制的空域内使用ATS监视系统时，在以下时间之后保持最后分配的速度和高度或最低飞行高度（如果更高），持续7分钟：到达最后分配的高度或最低飞行高度的时间，或应答机设置为7600代码的时间，或航空器未能报告其在强制报告点的位置的时间（以较晚者为准），然后根据已提交的飞行计划调整高度和速度。"
            }
        ]
    }
};

// 导出模块
module.exports = {
    ICAO_DIFFERENCES_COMM_FAILURE_EASTERN_EUROPE
};