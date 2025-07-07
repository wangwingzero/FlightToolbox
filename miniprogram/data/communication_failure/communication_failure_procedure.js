/**
 * @fileoverview Communication Failure Procedure as per Doc 4444.
 * This file contains the procedure to be followed in the event of a two-way communication failure.
 */

const communicationFailureProcedure = {
    title: "国际通信失效程序",
    document: "Doc 4444 - 空中航行服务程序",
    source_chapter: "第15章：关于紧急情况、通信失效和意外事件的程序",
    source_section: "15.3 空地通信联络失效",
    general_procedures: {
      transponder_code: "A模式, 7600",
      ads_b_ads_c: "利用所有可供使用的手段发送紧急和/或紧迫信号"
    },
    action_by_atc: [
      "立即采取措施，要求航空器做出用ATS监视系统可观测到的指定机动飞行，或可能时，拍发一个表示确认的指定信号，以证实该航空器能否收到信息。",
      "如果航空器不能表明它能够收到并确认信息，须根据该航空器的假定情况，保持通信失效的航空器与其他航空器之间的间隔。",
      "在相信航空器可守听的频率上，向该航空器盲发说明有关空中交通管制单位所采取行动的信息。",
      "向在联络失效航空器假定位置附近的其他航空器提供有关情报。",
      "向该航路沿线的所有有关空中交通服务单位发送有关失去无线电通信联络的情报。",
      "当接到恢复通信或着陆的情报后，通知相关单位。",
      "如果航空器在预计到达时间30分钟内仍没有报告，将通知运营人或其指定代表。"
    ],
    action_by_aircraft: {
      vfr_conditions: {
        description: "在目视气象条件下 (VMC):",
        steps: [
          "继续保持在目视气象条件下飞行。",
          "在最近的合适机场着陆。",
          "用最迅速的手段向有关空中交通管制单位报告其到达信息。"
        ]
      },
      imc_conditions: {
        description: "在仪表气象条件下 (IMC):",
        steps: {
          speed_and_level: {
            procedural_separation: "保持最后指定的速度与高度层，或当最低飞行高度更高时则保持最低飞行高度，飞行20分钟，随后根据申报的飞行计划调整高度层与速度。",
            ats_surveillance: "在出现通信失效迹象7分钟后，保持最后指定的速度与高度层，或当最低飞行高度更高时则保持最低飞行高度，随后根据申报的飞行计划调整高度层和速度。"
          },
          route: "以最直接的方式前行，以便在到达下一个重要点之前重新加入现行飞行计划的航路，并在此导航设备或定位点上空等待至开始下降。",
          descent_and_approach: "在或尽可能接近于最后收到和确认的预期进近时间，或未收到和确认的预期进近时间时，在或尽可能接近于现行飞行计划中的预计到达时间，开始从等待的导航设备或定位点上空下降，并完成正常的仪表进近。",
          landing: "在预计到达时间或最后确认的预期进近时间之后的30分钟内着陆（取较晚者）。"
        }
      }
    }
  };
  
  // 导出模块
  module.exports = {
    communicationFailureProcedure
  };