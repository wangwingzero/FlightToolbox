/**
 * @fileoverview IFR Aircraft Two-Way Radio Communication Failure General Procedure in China.
 * This file outlines the procedures for IFR aircraft in the event of a communication failure within Chinese airspace,
 * as per the notification from the Civil Aviation Administration of China (CAAC).
 */

const chinaCommFailureProcedure = {
    title: "仪表飞行规则航空器地空双向无线电通信失效通用程序",
    document: "民航发〔2023〕6号",
    applicability: "执行仪表飞行规则的民用航空器在中国境内",
  
    // 应答机编码设定
    transponderSetting: {
      initialAction: "在主用、备用、紧急(121.5MHz)、上一和下一频率均无法建立联系后，判定为通信失效，应及时将应答机设定为7600。",
      emergencyClimb: "如需紧急改变高度，可先设定7600，再进行操作。",
      otherIntentions: {
        returnToDeparture: "应答机编码在7600和7601间以30秒间隔重复调整2次，最终设为7600直至着陆。",
        proceedToTakeoffAlternate: "应答机编码在7600和7602间以30秒间隔重复调整2次，最终设为7600直至着陆。"
      }
    },
  
    // 通信失效后的操作要求
    operationalRequirements: {
      restoreCommunication: "在条件允许时，尝试通过一切可能手段（数据链、卫星电话等）恢复通信。",
      blindTransmission: "改变飞行意图前，在主用、备用和紧急频率121.5MHz盲发后续飞行意图两遍，并应答机“识别(IDENT)”一次。"
    },
  
    // 通信失效后的一般程序 (飞往目的地)
    generalProcedureToDestination: {
      nonSurveillanceAirspace: {
        title: "在不提供监视管制服务的空域",
        action: "在飞越未报告的强制报告点之后，继续保持最后指定的速度与高度(层)飞行20分钟，当最低飞行高度更高时则保持最低飞行高度飞行20分钟，随后根据申报的飞行计划调整速度与高度(层)。"
      },
      surveillanceAirspace: {
        title: "在提供监视管制服务的空域",
        action: "保持最后指定的速度与高度(层)沿飞行计划航径飞行7分钟，当最低飞行高度更高时则保持最低飞行高度飞行7分钟，随后根据申报的飞行计划调整速度与高度(层)。",
        timingStart: "计时开始于以下三者中的最晚者：①达到最后指定高度或最低飞行高度；②应答机设为7600；③未能在强制报告点报告。"
      },
      commonSteps: {
        enroute: "按照现行飞行计划航路飞至目的地机场的导航设备或定位点，并在该点上空等待。",
        descent: "按照或尽可能接近于最后确认的预计进近时刻（如无，则按飞行计划的预计到达时刻）开始下降。",
        approachAndLanding: "完成正常的仪表进近程序，并在飞行计划预计到达时刻或最后收到的预计进近时刻（取较晚者）之后30分钟之内着陆。"
      }
    },
  
    // 其他飞行路径意图的实施
    implementationOfOtherIntentions: {
      returnToDeparture: {
        title: "返回起飞机场着陆",
        path: "按照标准仪表离场(SID)至少飞至SID终点，之后根据最后收到的通播中着陆跑道就近选择标准仪表进场(STAR)，并从STAR起点加入程序。如无STAR，选择最短路径飞向最近的起始进近定位点。"
      },
      proceedToTakeoffAlternate: {
        title: "飞往起飞备降机场着陆",
        path: "按照标准仪表离场(SID)至少飞到SID终点，之后沿常规航路、航线飞往起飞备降机场。"
      },
      proceedToDestinationAlternate: {
        title: "飞往目的地备降场",
        path: "在目的地机场复飞后，在复飞等待点上升至最低飞行高度，按照现行飞行计划飞往第一目的地备降场。"
      }
    }
  };
  
  // 导出模块
  module.exports = {
    chinaCommFailureProcedure
  };