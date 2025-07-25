// 危险品携带规定数据
// 数据来源：中国东方航空《危险品操作速查指南 2025.01》
// 提取部分：旅客或机组成员携带危险品的规定 (P7-8)

var dangerousGoodsRegulations = [
  {
    "item_name": "酒精饮料",
    "description": "每人允许携带零售包装的酒精饮料（酒精浓度大于24%不超过70%），装于不超过5L的容器内，总净数量不得超过5L。（注：酒精浓度不大于24%的酒精饮料不受IATA《DGR》限制，大于70%的酒精饮料禁止放入手提行李或托运行李内运输。）",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "1.4S项弹药",
    "description": "包装牢固安全的1.4S项弹药（仅限1.4S项中的UN0012或UN0014）：仅供旅客个人使用条件下，每人携带毛重限量不超过5kg。超过一名以上旅客所携带的枪弹不得合成一个或数个包装件。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "雪崩救援背包",
    "description": "每位旅客可携带一个含有一个或多个2.2项压缩气体气瓶的雪崩救援背包。该背包如装有发烟装置，其中1.4S项的爆炸品净重不得超过200毫克。背包必须正确包装确保不会意外触发，背包中的空气袋必须装有减压阀。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "安装有不可拆卸锂电池的行李箱 (智能行李箱)",
    "description": "条件：锂金属电池超过0.3克或锂离子电池超过2.7Wh。此类行李箱完全禁止运输。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "禁止"
  },
  {
    "item_name": "安装有锂电池的行李箱 (智能行李箱)",
    "description": "锂电池不可拆卸：锂金属电池锂含量不超过0.3克，锂离子电池额定瓦特小时不超过2.7Wh。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "安装有锂电池的行李箱 (智能行李箱)",
    "description": "锂电池可拆卸：如行李箱被托运，则必须拆下锂电池，拆下的锂电池必须放置在客舱内运输（手提或随身），或将整个行李箱带入客舱。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": "托运时须拆卸电池并随身携带。"
  },
  {
    "item_name": "电池，备用/零散的 (含充电宝)",
    "description": "包括用于便携式电子设备的锂电池、非溢漏型电池、镍氢电池和干电池。主要目的是作为电源的设备(例如：充电宝)应视为备用电池。这些电池应单个做好保护以防止短路。锂金属电池锂含量不超过2克，锂离子电池额定瓦特小时不超过100Wh，每位旅客最多可携带20块。非溢漏型电池额定电压不得超过12V，额定瓦特小时不得超过100Wh，每位旅客最多只能携带2块。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": "仅能作为手提行李运输。"
  },
  {
    "item_name": "装过易燃液体燃料的野营炉燃料容器",
    "description": "野营炉的燃料罐和/或燃料容器必须排空所有的液体燃料，并采取相应措施消除危险。必须清空至少一小时，然后开口放置至少六小时，使残留燃料挥发。随后，必须将盖子上紧，用吸附材料包裹，并放入密封的聚乙烯袋中。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "仅能作为托运行李运输。"
  },
  {
    "item_name": "化学制剂监控设备",
    "description": "“禁止化学武器组织”成员公务旅行时携带的含有放射性物质的设备，其放射性物质活度不得超过IATA《DGR》10.3.C表中的活度限制。例如：安全包装且不带锂电池的化学试剂监控器(CAM)和/或快速警报和鉴定设备监控器(RAID-M)。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "使人致残的器具",
    "description": "如催泪喷射器、胡椒喷雾器等含有刺激性或会使人致残的器具禁止随身携带或作为手提行李和托运行李运输。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "禁止"
  },
  {
    "item_name": "干冰 (固体二氧化碳)",
    "description": "用于包装易腐物品的干冰，每人携带数量不超过2.5kg，且包装件可以释放二氧化碳气体时，可作为手提行李或托运行李运输。作为托运行李运输的干冰，必须在托运行李上标记“DRY ICE”或“CARBON DIOXIDE, SOLID”，且需注明干冰的净重（2.5公斤或少于2.5公斤）。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "含电池的电子烟",
    "description": "包括电子雪茄、电子烟斗以及个人雾化器。只能在手提行李中携带。此类装置和/或电池不允许在客舱内充电，旅客和机组成员应采取措施避免此类设备意外启动。备用电池应单个做好保护以防止短路，且锂电池应符合UN38.3测试标准，锂金属电池锂含量不超过2克，锂离子电池额定瓦特小时不超过100Wh。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": "仅能放在手提行李中运输。"
  },
  {
    "item_name": "电击武器 (如：泰瑟枪)",
    "description": "含有爆炸物质、压缩气体、锂电池等危险品的电击武器禁止旅客随身携带或作为手提行李和托运行李运输。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "禁止"
  },
  {
    "item_name": "燃料电池",
    "description": "含有燃料用于驱动便携式电子设备（如照相机、手机、手提电脑、便携式摄像机等）的燃料电池。燃料或燃料盒中燃料量需符合限制，且只能在手提行李中运输。需符合IATA《DGR》2.3.5.9规定。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "燃料电池备用燃料盒",
    "description": "便携式电子设备的备用燃料电池盒，每一旅客可以在手提行李、交运行李或者随身携带不超过2个备用燃料电池盒，不允许在飞机上给燃料电池盒充装燃料。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "小型非易燃气体钢瓶",
    "description": "内含二氧化碳或2.2项其它气体的小型气体钢瓶，每个供人穿着的自动充气个人安全设备（如救生衣），最多可装2个此类气瓶。每位旅客最多可携带2个这样的设备和每个设备2个备用气瓶登机，最多可携带4个为其他装置配备的容积不超过50ml的气瓶。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "用于机械假肢的非易燃、无毒气体钢瓶",
    "description": "用于操纵机械假肢运动的2.2项小气瓶。为保证旅途中的需要，还可携带同样大小的备用气瓶。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "装有烃类气体气瓶的头发造型设备",
    "description": "每一旅客或机组人员只可携带一支，但其安全盖必须紧扣于发热元件上。在任何时候都不得在飞机上使用。备用气瓶不得装入托运或手提行李中。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "含有冷冻液氮的隔热包装 (液氮干装)",
    "description": "液氮被完全吸附于多孔材料中，内装物仅为非危险品。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "内燃发动机或燃料电池发动机",
    "description": "不含电池或其他危险品的、单独携带或装入机器或其他装置中的易燃液体内燃发动机或燃料电池发动机，仅可作为托运行李运输，且必须符合IATA《DGR》特殊规定A70的相关要求。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "便携式电子设备 (含锂电池)",
    "description": "内含锂含量不超过2克锂金属或额定瓦特小时不超过100Wh锂离子电池的设备。如个人医疗设备(POC)和消费电子产品(手机、笔记本电脑等)。托运时须对设备加以保护以防损坏和意外启动，且必须完全关机。每位旅客最多携带/托运15个。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "含大容量锂电池的电子设备",
    "description": "装有额定能量超过100Wh但不超过160Wh的锂离子电池的便携式电子设备(包括医疗设备)，或装有锂含量超过2克但不超过8克的锂金属电池的便携式医疗设备。放置在托运行李中的设备必须完全关闭并加以保护。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "备用大容量锂电池",
    "description": "额定能量超过100Wh但不超过160Wh的锂离子电池，或锂含量超过2克但不超过8克的锂金属电池。仅能在手提行李中携带2块，且必须单个做好保护以防止短路。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "安全火柴或小型打火机",
    "description": "每位旅客或机组人员可携带一小盒安全火柴或一个小型打火机自用。但含有不能被吸收的液体燃料(不包括液化气)的打火机除外。火柴和打火机不允许放入手提行李和托运行李。注：1.“即擦式”火柴、“蓝焰”或“雪茄”打火机及无安全盖的锂电池驱动打火机禁止。2.国内航班和中国始发的国际航班禁止携带火柴、打火机。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "仅允许随身携带"
  },
  {
    "item_name": "助行器(电动轮椅) - 非溢漏型电池",
    "description": "非溢漏型电池驱动的轮椅。运输时须防意外启动。电池须符合特殊规定A67/A199/A123。可固定在轮椅上运输，或卸下放入坚固硬质包装在货舱运输。每位旅客最多可运输一块备用非溢漏型电池或两块备用镍氢/干电池。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "助行器(电动轮椅) - 溢漏型电池",
    "description": "溢漏型电池驱动的轮椅。必须始终能以直立方式装载。如不能，则须卸下电池。卸下的电池必须装入符合规定的坚固硬质包装中运输。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "助行器(电动轮椅) - 锂电池",
    "description": "锂电池驱动的轮椅。锂电池须符合UN38.3测试。电池可固定在轮椅上运输，或卸下（每块不超过300Wh）在客舱内运输。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "备用轮椅锂电池",
    "description": "从轮椅上卸下的锂电池。每位旅客最多可携带一块不超过300Wh的备用电池，或两块各不超过160Wh的备用电池。备用电池必须在客舱内运输，并做好保护。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": true,
    "special_condition": null
  },
  {
    "item_name": "非放射性药用或化妆用品 (含气溶胶)",
    "description": "如发胶、香水及含酒精药品；和属于2.2项的非易燃无毒气溶胶。总净重不得超过2kg或2L，每一单件物品净重不得超过0.5kg或0.5L。气溶胶释放阀门必须由盖子保护。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "医用小型氧气瓶或空气瓶",
    "description": "禁止旅客自行托运或携带医用小型氧气瓶或空气瓶。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "禁止"
  },
  {
    "item_name": "渗透装置 (空气质量检测校准设备)",
    "description": "用于空气质量检测校准的设备仅能作为托运行李运输，该设备必须符合IATA《DGR》特殊规定A41的要求。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "放射性同位素心脏起搏器",
    "description": "包括那些植入人体内或安装在体外的以锂电池为动力的装置。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "仅允许随身携带"
  },
  {
    "item_name": "保安型设备 (符合规定)",
    "description": "符合IATA《DGR》2.3.2.6要求的保安型设备仅能作为托运行李运输。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "保安型设备 (不符合规定)",
    "description": "除IATA《DGR》2.3.2.6规定外，内装锂电池和/或烟火装置等危险物品的保安型公文箱、现金箱、现金袋等保密型设备绝对禁止携带。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": false,
    "requires_captain_notification": false,
    "special_condition": "禁止"
  },
  {
    "item_name": "含少量易燃液体的非感染性标本",
    "description": "符合IATA《DGR》特殊规定A180的含有少量易燃液体的非感染性标本，可作为托运行李或手提行李运输。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "医用/临床用温度计",
    "description": "每位旅客可携带一支供个人使用的含水银的小型医用或临床用体温计，必须置于防护盒内。",
    "requires_operator_approval": false,
    "allowed_in_checked_baggage": true,
    "allowed_in_carry_on": true,
    "requires_captain_notification": false,
    "special_condition": null
  },
  {
    "item_name": "水银气压计或水银温度计 (官方机构使用)",
    "description": "政府气象局或类似官方机构的代表每人只能携带一支水银气压计或水银温度计（作为手提行李运输）。必须装进坚固的外包装，内有密封内衬或坚固的防漏口袋，能防止水银渗漏。须通知机长。",
    "requires_operator_approval": true,
    "allowed_in_checked_baggage": false,
    "allowed_in_carry_on": true,
    "requires_captain_notification": true,
    "special_condition": null
  }
];

// 模块化导出
module.exports = {
  dangerousGoodsRegulations
};