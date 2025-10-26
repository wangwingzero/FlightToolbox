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
        title: "（一）在不提供监视管制服务的空域",
        action: "航空器在飞越未报告的强制报告点之后，继续保持最后指定的速度与高度(层)飞行20分钟，当最低飞行高度更高时则保持最低飞行高度飞行20分钟，随后根据申报的飞行计划调整速度与高度(层)。"
      },
      surveillanceAirspace: {
        title: "在提供监视管制服务的空域",
        action: "保持最后指定的速度与高度(层)沿飞行计划航径飞行7分钟，当最低飞行高度更高时则保持最低飞行高度飞行7分钟，随后根据申报的飞行计划调整速度与高度(层)。",
        timingStart: "计时开始于以下三者中的最晚者：①达到最后指定高度或最低飞行高度；②应答机设为7600；③未能在强制报告点报告。"
      },
      rnav_vectoring: {
        title: "（三）在接受引导或由管制员指示使用区域导航(RNAV)偏置且无管制许可界限(Clearance Limit)时",
        action: "航空器驾驶员应尽快在到达下一个重要点之前重新加入现行飞行计划航路，并考虑适用的最低飞行高度。"
      },
      commonSteps: {
        enroute: "（四）按照现行飞行计划航路飞至指定为目的地机场提供服务的导航设备或定位点，并在该导航设备或定位点等待直到按照“本条(五)”的要求开始下降。",
        descent: "（五）按照或尽可能接近于最后确认收到的预计进近时刻，开始从“本条(四)”规定的导航设备或定位点下降；如未认收预计进近时刻时，则按照或尽可能接近于现行飞行计划的预计到达时刻，开始从“本条(四)”规定的导航设备或定位点下降。",
        approach: "（六）从指定的导航设备或定位点，按照规定的程序完成正常的仪表进近。",
        landing: "（七）如果可能，应当在飞行计划预计到达时刻或最后收到的预计进近时刻(取较晚者)之后30分钟之内着陆。"
      }
    },
  
    // 四、其他飞行路径意图的识别
    otherFlightPathIdentification: {
      principle: "在一般程序的基础上，在提供监视管制服务的空域内，航空器驾驶员可根据实际情况进行其他飞行路径选择。这些路径包括但不限于返回起飞机场着陆、飞往起飞备降机场和目的地备降机场等，其他飞行路径意图的应答机识别程序规定如下:",
      returnToDeparture: "（一）返回起飞机场着陆，应答机编码在7600和7601间以30秒间隔重复调整2次并最终设置为7600，直至着陆。",
      proceedToTakeoffAlternate: "（二）飞往起飞备降机场着陆，应答机编码在7600和7602间以30秒间隔重复调整2次并最终设置为7600，直至着陆。"
    },

    // 五、其他飞行路径意图的实施
    implementationOfOtherIntentions: {
      principle: "（一）航空器驾驶员选择其他飞行路径意图时，应首先以应答机编码表明意图(如适用)，随后按照所选择的飞行路径实施。",
      returnToDeparture: {
        title: "（二）返回起飞机场飞行路径",
        path: "按照标准仪表离场(SID)至少飞至SID终点，之后根据最后收到的通播中着陆跑道就近选择标准仪表进场(STAR)，并从STAR起点加入程序。如机场无STAR，应选择最短路径飞向最近的起始进近定位点，然后加入进近程序返场着陆。在此过程中，航空器应满足最低飞行高度。"
      },
      proceedToTakeoffAlternate: {
        title: "（三）飞往起飞备降机场飞行路径",
        path: "按照标准仪表离场(SID)至少飞到SID终点，之后沿常规航路、航线飞往起飞备降机场。在此过程中，航空器应满足最低飞行高度。",
        note: "如需选择起飞备降机场的，航空器运营人应在现行飞行计划中标注起飞备降机场。"
      },
      proceedToDestinationAlternate: {
        title: "（四）飞往目的地备降场飞行路径",
        path: "在目的地机场复飞后，在复飞等待点上升至最低飞行高度，按照现行飞行计划飞往第一目的地备降场。",
        note: "飞往目的地备降场的飞行路径及最低飞行高度，管制单位可向航空器运营人了解。"
      }
    }
  };
  
  // 导出模块
  module.exports = {
    chinaCommFailureProcedure
  };