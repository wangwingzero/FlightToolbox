/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - EUROPE
 *
 * @remarks
 * This data is extracted from the EUROPE AIRWAY MANUAL for reference only.
 * Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource eawm_europe.pdf
 *
 * @version 2.1.0
 * @date 2025-07-08
 */
const ICAO_DIFFERENCES_COMM_FAILURE_EUROPE = {
        "AZORES": {
            "region_name_en": "AZORES",
            "region_name_cn": "亚速尔群岛",
            "icao_differences": {
                "en": "Specifies detailed procedures for Horta Airport, including descending to FL100 until 25 DME from Horta VORTAC 'VFL'.",
                "cn": "规定了奥尔塔机场的详细程序，包括从奥尔塔VORTAC 'VFL'下降至FL100直到25 DME。"
            },
            "procedures": [
                {
                    "en": "Horta Airport Departure Procedure: Proceed at/to the last assigned and acknowledged level or to FL100, whichever is higher, until passing Horta VORTAC 'VFL' 25 DME; thereafter adjust level and speed in accordance with the filed flight plan.",
                    "cn": "奥尔塔机场离场程序：以最后分配并确认的高度层或FL100（取较高者）飞行，直至飞越奥尔塔VORTAC 'VFL' 25 DME；之后根据已提交的飞行计划调整高度层和速度。"
                },
                {
                    "en": "If being radar vectored or proceeding offset, when passing Horta VORTAC 'VFL' 25 DME, rejoin the current flight plan route.",
                    "cn": "如果正在接受雷达引导或偏航飞行，当飞越奥尔塔VORTAC 'VFL' 25 DME时，重新加入当前飞行计划航路。"
                }
            ]
        },
        "BELGIUM_AND_LUXEMBOURG": {
            "region_name_en": "BELGIUM AND LUXEMBOURG",
            "region_name_cn": "比利时和卢森堡",
            "icao_differences": {
                "en": "If 'Delay not determined' has been received, pilots should divert to an alternate aerodrome instead of attempting to land at the destination.",
                "cn": "如果收到“延误未确定”的指令，飞行员应改航至备降机场，而不是尝试在目的地着陆。"
            },
            "procedures": [
                {
                    "en": "If 'Delay not determined' has been received and radio failure occurs before an EAT is given, pilots shall not attempt to land at their planned destination, but should fly at their assigned level to an area in which VMC prevail, and where they can approach and land visually at a suitable aerodrome.",
                    "cn": "如果在收到EAT（预计进近时间）之前，收到了“延误未确定”信息且发生无线电失效，飞行员不应尝试在计划目的地着陆，而应在指定高度层上飞往一个VMC（目视气象条件）区域，并在那里目视进近并降落在一个合适的机场。"
                }
            ]
        },
        "CROATIA": {
            "region_name_en": "CROATIA",
            "region_name_cn": "克罗地亚",
            "icao_differences": {
                "en": "Specifies a 3-minute rule for maintaining the last assigned level after departure if cleared to an intermediate level before climbing to the flight planned cruising level.",
                "cn": "规定了如果在离场时被指令到中间高度层，之后再爬升至飞行计划巡航高度，则应在最后指定高度层保持3分钟的规则。"
            },
            "procedures": [
                {
                    "en": "Departure Procedure: If a cruising level other than the one given in the flight plan is assigned according to en-route clearance to the pilot, when departing according to IFR in IMC, he shall, in case of radio communication failure, after operating the transponder, maintain the level prescribed in the departure route or the level assigned by ATC for a period of 3 minutes and then continue his climb to the cruising level indicated in the flight plan.",
                    "cn": "离场程序：如果在仪表气象条件下（IMC）按仪表飞行规则（IFR）离场时，飞行员收到的航路许可是爬升至一个不同于飞行计划巡航高度的临时高度层，一旦发生通信失效，在设置应答机后，应保持离场程序中规定的高度或空中交通管制（ATC）指定的高度，持续3分钟，然后继续爬升至飞行计划中注明的巡航高度。"
                }
            ]
        },
        "FRANCE": {
            "region_name_en": "FRANCE",
            "region_name_cn": "法国",
            "icao_differences": {
                "en": "Provides highly detailed communication failure procedures for specific TMAs, including actions after missed approach, specific holding patterns, altitudes, and diversion routes.",
                "cn": "为特定的终端管制区（TMA）提供了非常详细的通信失效程序，包括复飞后的操作、特定的等待航线、高度和改航航路。"
            },
            "procedures": [
                {
                    "en": "General: If communication failure occurred during the arrival phase (STAR), the approach procedure phase to an airport, or the departure phase from an airport (SID), the pilot will comply with the specific procedures published for that airport, if any.",
                    "cn": "总则：如果通信失效发生在到达阶段（STAR）、机场进近程序阶段或离场阶段（SID），飞行员应遵守为该机场发布的任何特定程序。"
                },
                {
                    "en": "Paris Charles de Gaulle (LFPG) Arrival: Proceed to the initial approach fix (IAF) published on the STAR chart at the last assigned and acknowledged flight level. Comply with the vertical profile of the STAR. Commence approach at the EAT or, if no EAT, at the time calculated from the flight plan.",
                    "cn": "巴黎戴高乐机场 (LFPG) 到达：以最后分配并确认的高度层飞往STAR图上发布的初始进近点（IAF）。遵守STAR的垂直剖面。在预计进近时间（EAT）开始进近，如无EAT，则按飞行计划计算的时间开始。"
                },
                {
                    "en": "Paris Orly (LFPO) Arrival: If failure occurs before the IAF, proceed to the IAF. Hold at the last assigned level. Leave the holding pattern to commence the approach at the EAT. If no EAT is acknowledged, wait for 10 minutes in the hold before commencing the approach.",
                    "cn": "巴黎奥利机场 (LFPO) 到达：如果通信失效发生在初始进近点（IAF）之前，飞往IAF。在最后指定的高度层上等待。在预计进近时间（EAT）离开等待航线开始进近。如果未确认EAT，则在等待航线中等待10分钟后再开始进近。"
                },
                {
                    "en": "Nice TMA Arrival: Proceed to the IAF at the last assigned and acknowledged flight level...stay in the holding at this level until the latest time of the following: EAT; or arrival time in the holding pattern +10 minutes. Then descend in the holding pattern to FL80 (IAF MUS) or FL70 (IAF NERAS).",
                    "cn": "尼斯TMA到达：以最后分配并确认的高度层飞往初始进近点（IAF）...在该高度层上等待，直到预计进近时间（EAT）或到达等待航线时间后10分钟（取较晚者）。然后在等待航线中下降至FL80（IAF MUS）或FL70（IAF NERAS）。"
                }
            ]
        },
        "GERMANY": {
            "region_name_en": "GERMANY",
            "region_name_cn": "德国",
            "icao_differences": {
                "en": "Specifies communication failure procedures for flights on a 'Transition to Final Approach' or after a 'DIRECT TO' clearance, requiring continuation on the procedure's lateral and vertical profile.",
                "cn": "规定了在“过渡到最后进近”或收到“直飞”指令后发生通信失效的程序，要求继续遵循程序的横向和垂直剖面。"
            },
            "procedures": [
                {
                    "en": "Flights on Transition to Final Approach: After receiving a 'TRANSITION' clearance: Immediate setting of transponder code to Mode A 7600 and continuation of the flight in accordance with the lateral and vertical description of the procedure including the charted speed instructions, followed by a final approach segment of a published standard instrument approach procedure.",
                    "cn": "在过渡到最后进近的航班：收到“TRANSITION”许可后：立即将应答机设置为A模式7600代码，并根据程序的横向和垂直描述（包括图表上的速度指示）继续飞行，然后执行已发布的标准仪表进近程序的最后进近阶段。"
                }
            ]
        },
        "GIBRALTAR": {
            "region_name_en": "GIBRALTAR",
            "region_name_cn": "直布罗陀",
            "icao_differences": {
                "en": "If radio contact is lost during a surveillance radar approach, the procedure is to climb immediately to 4000ft QNH and proceed to PIMOS.",
                "cn": "如果在监视雷达进近期间失去无线电联系，程序是立即爬升至4000英尺QNH高度并飞往PIMOS。"
            },
            "procedures": [
                {
                    "en": "If radio contact is lost for more than 10 seconds during a surveillance radar approach, commence immediate climb to 4000ft QNH. Once level at 4000ft QNH proceed own navigation to PIMOS.",
                    "cn": "如果在监视雷达进近期间无线电联系丢失超过10秒，立即开始爬升至4000英尺QNH。在4000英尺QNH高度改平后，自行导航至PIMOS。"
                }
            ]
        },
        "GREECE": {
            "region_name_en": "GREECE",
            "region_name_cn": "希腊",
            "icao_differences": {
                "en": "Provides specific climb altitudes (e.g., 4500ft for Kerkira, 6000ft for Rodos) and navigation aids for communication failures during radar vectors for a visual approach in IMC.",
                "cn": "为在仪表气象条件下（IMC）进行目视进近的雷达引导期间发生通信失效提供了特定的爬升高度（例如，克基拉为4500英尺，罗得岛为6000英尺）和导航设备指引。"
            },
            "procedures": [
                {
                    "en": "KERKIRA TMA: in case he was vectored for a visual approach to RWY 16/34, and still in IMC, he should proceed, by his own navigational means to 'GAR' VORDME maintaining the last assigned altitude, if it is higher or equal to 4500ft (QNH) and execute the VOR V RWY 34 instrument approach procedure.",
                    "cn": "克基拉TMA：如果飞机在接受雷达引导进行目视进近至16/34号跑道时仍在IMC中，应自行导航至'GAR' VORDME，保持最后分配的高度（如果该高度高于或等于4500英尺QNH），并执行VOR V 34号跑道的仪表进近程序。"
                }
            ]
        },
        "IRELAND": {
            "region_name_en": "IRELAND",
            "region_name_cn": "爱尔兰",
            "icao_differences": {
                "en": "Extremely detailed procedures for specific airports (Dublin, Cork, Shannon). For Dublin departures, actions are differentiated based on whether the RFL is above/below FL80. Arrivals specify actions based on STAR sequence legs.",
                "cn": "为特定机场（都柏林、科克、香农）提供了极其详细的程序。对于都柏林离场，程序根据飞行高度层在FL80之上或之下来区分。进场程序根据STAR（标准终端到达航路）的顺序航段来规定具体操作。"
            },
            "procedures": [
                {
                    "en": "General Departure Procedure: RFL above FL80: Departing traffic cleared by ATC to a level/altitude below FL80 shall maintain the cleared level for a period of 3 minutes following the time the altitude/level is reached and thereafter adjust level and speed in accordance with filed flight plan.",
                    "cn": "通用离场程序：对于计划飞行高度层在FL80以上的离场航班，如果被ATC指令到FL80以下的高度层，应在达到该高度层后保持3分钟，然后根据已提交的飞行计划调整高度和速度。"
                },
                {
                    "en": "Dublin Airport Arrival RWY 28L/R, prior to Sequence Leg Entry: Proceed via the STAR to enter the appropriate Sequence Leg Entry hold (i.e. KERAV or SORIN) at the last cleared flight level. Commence descent in the hold to the Sequence Leg Entry flight level (FL80 or FL70 as appropriate) specified on the chart at, or as close as possible to the Expected Approach Time (EAT).",
                    "cn": "都柏林机场28L/R跑道进场，进入顺序航段前：通过STAR（标准终端到达航路）进入相应的顺序航段入口等待航线（KERAV或SORIN），保持最后许可的飞行高度层。在预计进近时间（EAT）或尽可能接近该时间，在等待航线中开始下降至图表上标明的顺序航段入口飞行高度层（FL80或FL70）。"
                },
                {
                    "en": "Shannon (EINN) Arrival: If failure occurs during STAR, proceed to the IAF for the appropriate runway. Hold at the last assigned level. Descend and commence approach at the EAT (if acknowledged) or after 10 minutes in the hold, whichever is later.",
                    "cn": "香农机场 (EINN) 到达：如果在STAR期间发生失效，飞往相应跑道的初始进近点（IAF）。在最后指定的高度层等待。在预计进近时间（EAT）（如已确认）或在等待航线中等待10分钟后（取较晚者），开始下降并进近。"
                },
                {
                    "en": "Cork (EICK) Arrival: If failure occurs on STAR, proceed to the IAF (CK) at the last assigned and acknowledged level. At the EAT (or 10 minutes after IAF passage if no EAT), descend to 3000ft in the hold, then commence the instrument approach.",
                    "cn": "科克机场 (EICK) 到达：如果在STAR上发生失效，以最后分配并确认的高度层飞往初始进近点（IAF）'CK'。在预计进近时间（EAT）（或如无EAT，则在飞越IAF后10分钟），在等待航线中下降至3000英尺，然后开始仪表进近。"
                }
            ]
        },
        "ITALY": {
            "region_name_en": "ITALY",
            "region_name_cn": "意大利",
            "icao_differences": {
                "en": "Specifies designated navaids for numerous airports. For Rome, procedures depend on aircraft position relative to the airport. For Milan, specific STAR-related procedures apply.",
                "cn": "为众多机场指定了导航设备。罗马的程序取决于飞机相对于机场的位置。米兰适用特定的与STAR相关的程序。"
            },
            "procedures": [
                {
                    "en": "Rome (Fiumicino, LIRF) Arrival: If north of the aerodrome, proceed to the 'RDL' holding pattern at the last assigned level. If south, proceed to 'OST' holding. Descend at EAT or 15 minutes after arriving at the hold, whichever is later.",
                    "cn": "罗马（菲乌米奇诺, LIRF）到达：如果在机场以北，飞往'RDL'等待航线并保持最后指定高度层。如果在南部，则飞往'OST'等待航线。在预计进近时间（EAT）或到达等待航线15分钟后（取较晚者）开始下降。"
                },
                {
                    "en": "Milan (Malpensa, LIMC) Arrival: Follow the published STAR procedure. If vectored off STAR, proceed direct to the IAF associated with that STAR. Hold at the last assigned level and commence descent at the EAT.",
                    "cn": "米兰（马尔彭萨, LIMC）到达：遵循已发布的STAR程序。如果被雷达引导偏离STAR，则直飞至与该STAR关联的初始进近点（IAF）。在最后指定的高度层上等待，并在预计进近时间（EAT）开始下降。"
                },
                {
                    "en": "TRAPANI (BIRGI) AIRPORT: If IFR in IMC, select transponder on code 7600 and proceed to fly to: MORUX at 3000ft (RWY 13R) or VETUR at 4000ft (RWY 31L), if pilot has received and read back to such Fix Limits.",
                    "cn": "特拉帕尼（比尔吉）机场：如果在仪表气象条件下（IMC），应答机设为7600，如果飞行员已收到并复诵了到这些定位点的许可，则飞往：MORUX，高度3000英尺（13R号跑道）；或VETUR，高度4000英尺（31L号跑道）。"
                }
            ]
        },
        "PORTUGAL": {
            "region_name_en": "PORTUGAL",
            "region_name_cn": "葡萄牙",
            "icao_differences": {
                "en": "Specifies RNAV arrival procedures for major airports (Lisbon, Faro, Porto), including proceeding to specific holding patterns and descending at ETA/EAT.",
                "cn": "为主要机场（里斯本、法鲁、波尔图）规定了RNAV进场程序，包括飞往特定的等待航线，并在预计到达/进近时间下降。"
            },
            "procedures": [
                {
                    "en": "Lisbon (LPPT) RNAV Arrival Procedure RWY 02: Proceed direct to the 'LSA' holding pattern at the last assigned level. At EAT, start descent to the initial approach altitude to carry out a standard IFR approach.",
                    "cn": "里斯本机场 (LPPT) RNAV 02号跑道进场程序：以最后分配的高度层直飞至'LSA'等待航线。在预计进近时间（EAT），开始下降至初始进近高度，以执行标准的IFR进近程序。"
                },
                {
                    "en": "Faro (LPFR) RNAV Arrival Procedure RWY 28: Proceed direct at/to the last assigned level to 'ADNOV' holding pattern. At EAT, start descent to initial approach altitude.",
                    "cn": "法鲁机场 (LPFR) RNAV 28号跑道进场程序：以最后分配的高度层直飞至'ADNOV'等待航线。在预计进近时间（EAT）开始下降至初始进近高度。"
                },
                {
                    "en": "PORTO (FRANCISCO SA CARNEIRO) AIRPORT Departure Procedures: Proceed at/to the last assigned and acknowledged level or to the level of SID if it is higher, until passing Porto VORDME 'PRT' 30 DME; Thereafter adjust level and speed in accordance with the filed flight plan.",
                    "cn": "波尔图（弗朗西斯科·萨·卡内罗）机场离场程序：以最后分配并确认的高度层或SID（标准仪表离场）规定的更高高度层飞行，直至飞越波尔图VORDME 'PRT' 30 DME；之后根据已提交的飞行计划调整高度层和速度。"
                }
            ]
        },
        "SPAIN": {
            "region_name_en": "SPAIN",
            "region_name_cn": "西班牙",
            "icao_differences": {
                "en": "Provides airport-specific procedures. If failure occurs on a STAR before the IAF, aircraft should hold over the IAF and descend after a holding pattern or at EAT.",
                "cn": "提供机场特定程序。如果通信失效发生在STAR上、初始进近点（IAF）之前，飞机应在IAF上空等待，并在完成一个等待航线后或在预计进近时间（EAT）开始下降。"
            },
            "procedures": [
                {
                    "en": "Madrid (Barajas, LEMD) Arrival: If failure occurs during STAR, proceed to the IAF for the runway in use. Maintain the last assigned level. At the EAT (if acknowledged) or after 3 minutes in the hold, commence descent and approach.",
                    "cn": "马德里（巴拉哈斯, LEMD）到达：如果在STAR期间发生失效，飞往使用中跑道的初始进近点（IAF）。保持最后指定的高度层。在预计进近时间（EAT）（如已确认）或在等待航线中等待3分钟后，开始下降并进近。"
                },
                {
                    "en": "Palma (LEPA) Arrival: If failure occurs during STAR, proceed to the IAF. Hold at the last assigned level. Descend after one holding pattern is completed or at EAT, whichever is later.",
                    "cn": "帕尔马机场 (LEPA) 到达：如果在STAR期间发生失效，飞往初始进近点（IAF）。在最后指定的高度层等待。在完成一个等待航线后或在预计进近时间（EAT）之后（取较晚者）下降。"
                },
                {
                    "en": "IBIZA AIRPORT Arrival Procedure: If communication failure occurs during a STAR before the IAF, maintain the last approved level or altitude acknowledged and hold over the IAF. Initiate the descent after completing a holding pattern, or after the EAT, if received, whichever is later, to accomplish a published IFR approach.",
                    "cn": "伊维萨机场到达程序：如果在STAR飞行期间、初始进近点（IAF）之前发生通信失效，保持最后批准并确认的高度层，并在IAF上空等待。在完成一个等待航线后，或在收到的预计进近时间（EAT）之后（取较晚者），开始下降以执行发布的IFR进近程序。"
                }
            ]
        },
        "SWEDEN": {
            "region_name_en": "SWEDEN",
            "region_name_cn": "瑞典",
            "icao_differences": {
                "en": "Detailed procedures for multiple TMAs. For Stockholm, if no inbound clearance is received, proceed to 'TEB' VORDME, descend to 2500ft in the hold, and then intercept the specific ILS for the runway-in-use.",
                "cn": "为多个终端管制区（TMA）提供详细程序。对于斯德哥尔摩，如未收到进场许可，应飞往'TEB' VORDME，在等待航线中下降至2500英尺，然后截获相应跑道的ILS（仪表着陆系统）。"
            },
            "procedures": [
                {
                    "en": "STOCKHOLM TMA: No Inbound Clearance received and/or acknowledged. Maintain the level last received and acknowledged. Proceed via the relevant TMA entry point direct to Tebby VORDME 'TEB'. In the 'TEB' holding descend to 2500ft MSL.",
                    "cn": "斯德哥尔摩TMA：未收到或确认进场许可。保持最后收到并确认的高度层。通过相关的TMA进入点直飞Tebby VORDME 'TEB'。在'TEB'等待航线中下降至平均海平面2500英尺。"
                }
            ]
        },
        "SWITZERLAND": {
            "region_name_en": "SWITZERLAND",
            "region_name_cn": "瑞士",
            "icao_differences": {
                "en": "Specifies a non-standard use of transponder code 7601; IFR flights shall use code 7600 even when continuing in VMC. Provides specific procedures for Basel-Mulhouse.",
                "cn": "规定了非标准的应答机代码7601用法；IFR航班即使在VMC下继续飞行也应使用7600代码。为巴塞尔-米卢斯机场提供了特定程序。"
            },
            "procedures": [
                {
                    "en": "IFR flights shall use SSR code 7600 in case of radio communication failure even when continuing in VMC to the nearest suitable aerodrome. SSR code 7601 as defined by SERA.14083 not yet implemented.",
                    "cn": "仪表飞行规则（IFR）航班在发生无线电通信失效时，即使在目视气象条件（VMC）下继续飞往最近的合适机场，也应使用SSR代码7600。SERA.14083中定义的SSR代码7601尚未实施。"
                }
            ]
        },
        "UNITED_KINGDOM": {
            "region_name_en": "UNITED KINGDOM",
            "region_name_cn": "英国",
            "icao_differences": {
                "en": "Extensive and highly detailed procedures for communication failures, specifying actions if failure occurs during SIDs, STARs, or radar vectoring. Includes specific procedures for major TMAs like London.",
                "cn": "极其详尽的通信失效程序，明确了在SID、STAR或雷达引导期间发生失效时的操作。包括针对伦敦等主要TMA的特定程序。"
            },
            "procedures": [
                {
                    "en": "INSTRUMENT METEOROLOGICAL CONDITIONS: Maintain for a period of 7 minutes, the current speed and last assigned level, or the minimum safe altitude if it is higher. The period of 7 minutes begins when the transponder is set to 7600.",
                    "cn": "仪表气象条件：保持当前速度和最后分配的高度层，或最低安全高度（如果更高），持续7分钟。7分钟的计时从应答机设置为7600时开始。"
                },
                {
                    "en": "Aircraft Inbound to London (Heathrow): fly to the appropriate holding point as detailed in the STAR; hold until the last acknowledged ETA +10 minutes, or EAT when this has been given; then commence descent for landing.",
                    "cn": "飞往伦敦（希思罗）的进场飞机：飞往STAR中详细说明的相应等待点；等待至最后确认的预计到达时间（ETA）后10分钟，或已给定的预计进近时间（EAT）；然后开始下降着陆。"
                },
                {
                    "en": "Aircraft Outbound from London (Gatwick) operating on FRANE SIDs: If a clearance to climb or rerouting has not been given, comply with the SID route and altitude limitations. At FRANE, join route M604 to DAGGA and maintain 6000ft until DAGGA; at DAGGA, commence climb to flight planned level.",
                    "cn": "从伦敦（盖特威克）离场并使用FRANE SID的飞机：如果未收到爬升或改航指令，应遵守SID的航路和高度限制。在FRANE点，加入M604航路飞往DAGGA并保持6000英尺直至DAGGA；在DAGGA之后，开始爬升至飞行计划高度层。"
                }
            ]
        }
    };
    
    // 导出模块
    module.exports = {
        ICAO_DIFFERENCES_COMM_FAILURE_EUROPE
    };