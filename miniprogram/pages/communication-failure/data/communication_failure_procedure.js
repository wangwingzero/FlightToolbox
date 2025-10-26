/**
 * @fileoverview Communication Failure Procedure as per ICAO Doc 4444 Chapter 15.3.
 * This file contains the ICAO standard procedures to be followed in the event of air-ground communication failure.
 * 
 * @source ICAO Doc 4444 - PANS-ATM Chapter 15.3 Air-Ground Communications Failure
 * @version Updated to match latest ICAO standards
 */

const communicationFailureProcedure = {
    title: {
      cn: "国际通信失效程序",
      en: "International Communication Failure Procedures"
    },
    document: {
      cn: "Doc 4444 - 空中航行服务程序",
      en: "ICAO Doc 4444 - PANS-ATM"
    },
    source_chapter: {
      cn: "第15章：关于紧急情况、通信失效和意外事件的程序",
      en: "Chapter 15: Procedures for Emergency, Communication Failure and Contingency Situations"
    },
    notes: [
      {
        cn: "注1：提供ATS监视服务时航空器遇到空地通信联络失效所适用的程序载于第八章8.8.3节。",
        en: "Note 1: Procedures to be applied in relation to an aircraft experiencing air-ground communication failure when providing ATS surveillance services are contained in Chapter 8, Section 8.8.3."
      },
      {
        cn: "注2：装有SSR应答机的航空器应使用应答机A模式7600编码，以表示它遇到空地通信联络失效。",
        en: "Note 2: An aircraft equipped with an SSR transponder is expected to operate the transponder on Mode A Code 7600 to indicate that it has experienced air-ground communication failure."
      },
      {
        cn: "注3：无论驾驶员选择何种编码，某些装备第一代ADS-B航空电子设备的航空器只有能力拍发普通紧急告警。",
        en: "Note 3: Some aircraft equipped with first generation ADS-B avionics have the capability to transmit a general emergency alert only, regardless of the code selected by the pilot."
      },
      {
        cn: "注4：亦可见第6章6.3.2.5，有关离场放行许可和航空器在这种情况下遇到空地通信联络失效所适用的程序。",
        en: "Note 4: See also Chapter 6, 6.3.2.5, concerning departure clearances and procedures to be applied in relation to an aircraft experiencing air-ground communication failure under such circumstances."
      },
      {
        cn: "注5：另见第5章5.4.2.6.3.2，关于在使用50 NM 纵向RNAV/RNP 10最低间隔标准时适用于通信失效的进一步要求。",
        en: "Note 5: See also Chapter 5, 5.4.2.6.3.2, for additional requirements applying to communication failure during the application of the 50 NM longitudinal RNAV/RNP 10 separation minimum."
      }
    ],
    source_section: {
      cn: "15.3 空地通信联络失效",
      en: "15.3 Air-Ground Communications Failure"
    },
    general_procedures: {
      transponder_code: {
        cn: "A模式, 7600",
        en: "Mode A, 7600"
      },
      ads_b_ads_c: {
        cn: "配备ADS-B和ADS-C的航空器可通过所有可用手段指示空地通信失效",
        en: "Aircraft equipped with ADS-B and ADS-C might indicate the loss of air-ground communication by all of the available means"
      },
      note: {
        cn: "某些第一代ADS-B设备在选择紧急模式时可能无法发送IDENT信号",
        en: "Some aircraft equipped with first generation ADS-B avionics do not have the capability of squawking IDENT while the emergency mode is selected"
      }
    },
    action_by_atc: {
      immediate_action: {
        cn: "一旦知道双向通信联络已经失效，须立即采取措施，要求航空器做一个用ATS监视系统可观测到的指定的机动飞行，或可能时，拍发一个表示确认的指定信号，以证实该航空器能否收到空中交通管制单位发出的信息。",
        en: "As soon as it is known that two-way communication has failed, action shall be taken to ascertain whether the aircraft is able to receive transmissions from the air traffic control unit by requesting it to execute a specified manoeuvre which can be observed by an ATS surveillance system or to transmit, if possible, a specified signal in order to indicate acknowledgement."
      },
      separation: {
        cn: "如果航空器不能表明它能够收到并确认信息，须根据该航空器的假定情况，保持通信失效的航空器与其他航空器之间的间隔。",
        en: "If the aircraft fails to indicate that it is able to receive and acknowledge transmissions, separation shall be maintained between the aircraft having the communication failure and other aircraft, based on the assumption that the aircraft will follow the prescribed procedures."
      },
      blind_transmission: {
        cn: "必须在相信航空器可守听的频率上，包括可使用的无线电导航设备或进近设备的音频频率上，向该航空器盲发说明有关空中交通管制单位所采取行动的信息。",
        en: "Appropriate information describing the action taken by the air traffic control unit shall be transmitted blind for the attention of the aircraft concerned, on the frequencies available on which the aircraft is believed to be listening, including the voice frequencies of available radio navigation or approach aids."
      },
      nearby_aircraft: {
        cn: "必须向在联络失效航空器假定位置附近的其他航空器提供有关情报。",
        en: "Pertinent information shall be given to other aircraft in the vicinity of the presumed position of the aircraft experiencing the failure."
      },
      coordination: {
        cn: "一经知道在其管辖区内飞行的航空器发生明显的无线电通信失效，空中交通服务单位必须向该航路沿线的所有有关空中交通服务单位发送有关失去无线电通信联络的情报。",
        en: "As soon as it is known that an aircraft which is operating in its area of responsibility is experiencing an apparent radiocommunication failure, an air traffic services unit shall forward information concerning the radiocommunication failure to all air traffic services units concerned along the route of flight."
      },
      restoration: {
        cn: "当空中交通管制单位接到发生通信失效的航空器已经恢复通信或已经着陆的情报后，该单位必须通知相关单位。",
        en: "When an air traffic control unit receives information that an aircraft, after experiencing a communication failure has re-established communication or has landed, that unit shall inform the relevant air traffic services units."
      },
      time_limit: {
        cn: "如果该航空器在驾驶员提供的预计到达时间、由区域管制中心计算的预计到达时间或最后收到的预计进近时间30分钟内仍没有报告（按以上三种情况最迟者为准），将有关该航空器的相关情报通知给运营人或其指定的代表。",
        en: "If the aircraft has not reported within thirty minutes after the estimated time of arrival furnished by the pilot, the estimated time of arrival calculated by the ACC, or the last acknowledged expected approach time, whichever is latest, pertinent information concerning the aircraft shall be forwarded to aircraft operators or their designated representatives."
      }
    },
    action_by_aircraft: {
      vfr_conditions: {
        description: {
          cn: "如果在目视气象条件下 (VMC):",
          en: "If in visual meteorological conditions (VMC):"
        },
        note: {
          cn: "15.3.3 a)与所有管制飞行相关",
          en: "15.3.3 a) relates to all controlled flights"
        },
        steps: [
          {
            cn: "继续保持目视气象条件飞行",
            en: "Continue to fly in visual meteorological conditions"
          },
          {
            cn: "在最近的合适机场着陆",
            en: "Land at the nearest suitable aerodrome"
          },
          {
            cn: "用最迅速的手段向有关空中交通管制单位报告其到达信息",
            en: "Report its arrival by the most expeditious means to the appropriate air traffic control unit"
          }
        ]
      },
      imc_conditions: {
        description: {
          cn: "如果在仪表气象条件下，或在驾驶员似乎不能按a)完成飞行的条件下 (IMC):",
          en: "If in instrument meteorological conditions or when conditions are such that it does not appear likely that the pilot will complete the flight in accordance with a) (IMC):"
        },
        note: {
          cn: "15.3.3 b)仅与仪表飞行规则飞行相关",
          en: "15.3.3 b) relates only to IFR flights"
        },
        steps: {
          speed_and_level: {
            procedural_separation: {
              cn: "在实施程序间隔的空域：保持最后指定的速度与高度层，或当最低飞行高度更高时则保持最低飞行高度，在未能报告强制报告点位置后飞行20分钟，随后根据申报的飞行计划调整高度层与速度。",
              en: "In airspace where procedural separation is being applied: maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 20 minutes following the aircraft's failure to report its position over a compulsory reporting point and thereafter adjust level and speed in accordance with the filed flight plan."
            },
            ats_surveillance: {
              cn: "在使用ATS监视系统提供空中交通管制的空域：保持最后指定的速度与高度层，或当最低飞行高度更高时则保持最低飞行高度，飞行7分钟，计时从以下时间中较晚者开始：(1)达到最后分配高度或最低飞行高度的时间；(2)设置应答机7600或ADS-B指示通信失效的时间；(3)未能报告强制报告点位置的时间。随后根据申报的飞行计划调整高度层和速度。",
              en: "In airspace where an ATS surveillance system is used in the provision of air traffic control: maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 7 minutes following: (1) the time the last assigned level or minimum flight altitude is reached; (2) the time the transponder is set to Code 7600 or the ADS-B transmitter is set to indicate the loss of air-ground communications; (3) the aircraft's failure to report its position over a compulsory reporting point; whichever is later and thereafter adjust level and speed in accordance with the filed flight plan."
            }
          },
          route: {
            cn: "按照现行飞行计划航路，继续向前飞行到指定为预定着陆服务的有关导航设备或定位点上空，并且当要求保证按5)实施时，在此导航设备或定位点上空等待至开始下降。",
            en: "Proceed according to the current flight plan route to the appropriate designated navigation aid or fix serving the destination aerodrome and, when required to ensure compliance with 5), hold over this aid or fix until commencement of descent."
          },
          vectoring: {
            cn: "在接受引导或由空中交通管制指示使用区域导航（RNAV）、在无规定限制的情况下进行偏移时，以最直接的方式前行，以便在到达下一个重要点之前重新加入现行飞行计划的航路，并考虑到适用的最低飞行高度。",
            en: "When being vectored or having been directed by ATC to proceed offset using RNAV without a specified limit, proceed in the most direct manner possible to rejoin the current flight plan route no later than the next significant point, taking into consideration the applicable minimum flight altitude."
          },
          descent_and_approach: {
            cn: "在或尽可能接近于最后收到和确认的预期进近时间开始从导航设备或定位点下降；或如未收到和确认预期进近时间，则在或尽可能接近于现行飞行计划预计到达时间开始下降，并完成指定导航设备或定位点的正常仪表进近程序。",
            en: "Commence descent from the navigation aid or fix specified in 4) at, or as close as possible to, the expected approach time last received and acknowledged; or, if no expected approach time has been received and acknowledged, at, or as close as possible to, the estimated time of arrival resulting from the current flight plan and complete a normal instrument approach procedure as specified for the designated navigation aid or fix."
          },
          landing: {
            cn: "在预计到达时间或最后确认的预期进近时间之后的30分钟内着陆（取较晚者）。",
            en: "Land, if possible, within 30 minutes after the estimated time of arrival specified in 5) or the last acknowledged expected approach time, whichever is later."
          }
        }
      }
    }
  };
  
  // 导出模块
  module.exports = {
    communicationFailureProcedure
  };