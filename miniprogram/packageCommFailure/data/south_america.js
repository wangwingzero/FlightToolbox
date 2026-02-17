/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - SOUTH AMERICA
 *
 * @remarks
 * This data is extracted from the SOUTH AMERICA AIRWAY MANUAL for reference only.
 * Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource eawm_south_america.pdf
 *
 * @version 3.0.0
 * @date 2025-07-08
 */
const ICAO_DIFFERENCES_COMM_FAILURE_SOUTH_AMERICA = {
    "BRAZIL": {
        "region_name_en": "BRAZIL",
        "region_name_cn": "巴西",
        "icao_differences": {
            "en": "Specifies a 10-minute rule after communication failure before executing procedures. Details specific transponder settings, VMC/IMC procedures, and distinct actions for radar-controlled versus non-radar airspace, which differ from ICAO's 7/20-minute rules.",
            "cn": "规定了通信失效10分钟后执行程序。详细说明了特定的应答机设置、VMC/IMC程序，以及雷达管制与非雷达空域下的不同行动，这与ICAO的7/20分钟规则有所区别。"
        },
        "procedures": [
            {
                "en": "If contact is not established within 10 minutes after communication failure, the pilot must: set transponder to code 7600. If the aircraft is not so equipped, select code 2000; make blind transmissions of all maneuvers executed on the frequencies of the ATC agency that should be providing control at that moment; and keep listening on the frequency of the broadcasting station of the destination airport, or alternate, if possible.",
                "cn": "如果在通信失效后10分钟内未建立联系，飞行员必须：将应答机设置为代码7600。如果飞机未配备该设备，则选择代码2000；在当时应提供管制的ATC机构的频率上盲发所有执行的机动；并且如果可能，保持收听目的地机场或备降机场的广播站频率。"
            },
            {
                "en": "When flying in VMC, the pilot must: continue flight in VMC; land at the nearest suitable airport; and inform the respective ATC agency of the landing by the fastest means available.",
                "cn": "在目视气象条件（VMC）下飞行时，飞行员必须：继续在VMC下飞行；在最近的合适机场降落；并通过最快捷的方式将着陆情况通知相应的ATC机构。"
            },
            {
                "en": "When flying in IMC, the pilot must: keep the last flight level assigned and acknowledged for 10 minutes from the time of the transponder setting to code 7600. After this period, adjust speed and level according to the flight plan; follow the flight plan route to the destination airport; upon arriving over the navigation aid of the destination airport, start the descent and execute the instrument approach procedure published for said aid; and try to land, if possible, within 30 minutes of the estimated time of arrival filed in the flight plan.",
                "cn": "在仪表气象条件（IMC）下飞行时，飞行员必须：从应答机设置为7600代码时起，保持最后分配并确认的飞行高度层10分钟。此后，根据飞行计划调整速度和高度；遵循飞行计划航线飞往目的地机场；到达目的地机场的导航设备上空后，开始下降并执行为该导航设备发布的仪表进近程序；并且如果可能，在飞行计划中预计到达时间的30分钟内尝试着陆。"
            },
            {
                "en": "For an aircraft under radar control, the pilot must keep the last flight level assigned and acknowledged for 3 minutes. After this period, follow the procedures established for IMC conditions described above.",
                "cn": "对于接受雷达管制的飞机，飞行员必须保持最后分配并确认的飞行高度层3分钟。此后，遵循上述为IMC条件制定的程序。"
            }
        ]
    },
    "COLOMBIA": {
        "region_name_en": "COLOMBIA",
        "region_name_cn": "哥伦比亚",
        "icao_differences": {
            "en": "Specifies detailed procedures for VMC and IMC conditions, including maintaining the last assigned heading for 3 minutes in IMC before proceeding with the flight plan.",
            "cn": "规定了VMC和IMC条件下的详细程序，包括在IMC中保持最后指定的航向3分钟，然后再根据飞行计划继续飞行。"
        },
        "procedures": [
            {
                "en": "If the aircraft is in VMC, it will continue its flight in VMC and land at the nearest suitable airport, notifying the respective ATS unit of its arrival through the quickest possible means.",
                "cn": "如果航空器处于VMC（目视气象条件），它将继续在VMC下飞行，并在最近的合适机场着陆，通过最快的方式向相应的ATS单位报告其抵达。"
            },
            {
                "en": "If the aircraft is in IMC, or if the pilot considers it impossible to complete the flight in VMC, they must maintain the last assigned heading for 3 minutes and then proceed via the most direct route to the first point of their flight plan route, continuing the flight to the destination airport as per the flight plan.",
                "cn": "如果航空器处于IMC（仪表气象条件），或者飞行员认为无法在VMC下完成飞行，必须保持最后指定的航向飞行3分钟，然后通过最直接的航线飞往其飞行计划航路的第一个点，之后按照飞行计划继续飞往目的地机场。"
            },
            {
                "en": "They will begin the descent over the initial approach fix at the estimated time of arrival calculated based on the flight plan, and execute the instrument approach procedure published in the national AIP.",
                "cn": "他们将在根据飞行计划计算出的预计到达时间，在初始进近定位点上空开始下降，并执行国家AIP中公布的仪表进近程序。"
            }
        ]
    },
    "PARAGUAY": {
        "region_name_en": "PARAGUAY",
        "region_name_cn": "巴拉圭",
        "icao_differences": {
            "en": "Requires maintaining the last assigned altitude or MSA for 20 minutes before continuing with the flight plan.",
            "cn": "要求在继续执行飞行计划前，保持最后分配的高度或最低安全高度20分钟。"
        },
        "procedures": [
            {
                "en": "Maintain the last assigned flight level and speed, or the minimum sector altitude (MSA) if it is higher, for twenty (20) minutes, after which the flight will continue according to the flight plan.",
                "cn": "保持最后分配的飞行高度层和速度，或者扇区最低高度（MSA）（如果更高），持续二十分钟（20分钟），之后按照飞行计划继续飞行。"
            },
            {
                "en": "Proceed to the navigation aid of the destination airport, and begin the descent at the estimated time of arrival according to the flight plan.",
                "cn": "飞往目的地机场的导航设备，并在飞行计划的预计到达时间开始下降。"
            },
            {
                "en": "Execute the published instrument approach procedure for said airport, and land if possible within thirty (30) minutes of the estimated time of arrival.",
                "cn": "执行该机场公布的仪表进近程序，并在预计到达时间后的三十分钟（30分钟）内尽可能着陆。"
            }
        ]
    },
    "URUGUAY": {
        "region_name_en": "URUGUAY",
        "region_name_cn": "乌拉圭",
        "icao_differences": {
            "en": "Mandates squawking code 7600 and specifies a 7-minute holding period at the destination's initial approach fix before commencing the approach.",
            "cn": "强制要求应答机挂7600代码，并规定在开始进近前，在目的地初始进近定位点上空等待7分钟。"
        },
        "procedures": [
            {
                "en": "The pilot of an aircraft will select code 7600 on their transponder.",
                "cn": "航空器驾驶员应在其应答机上选择7600代码。"
            },
            {
                "en": "If in IMC, or if VMC conditions cannot be maintained, the pilot will proceed to the initial approach fix of the destination airport and wait for 7 minutes before commencing the instrument approach procedure. The descent should be initiated at the EAT if one was received and acknowledged, or else at the ETA from the flight plan.",
                "cn": "如果在IMC条件下，或者无法保持VMC，飞行员应飞往目的地机场的初始进近定位点，并在开始仪表进近程序前等待7分钟。如果已收到并确认了预计进近时间（EAT），则应在EAT开始下降，否则按飞行计划的预计到达时间（ETA）开始下降。"
            }
        ]
    }
};

// 导出模块
module.exports = {
    ICAO_DIFFERENCES_COMM_FAILURE_SOUTH_AMERICA
};