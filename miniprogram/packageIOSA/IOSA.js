// IOSA审计术语定义数据
// 数据结构支持术语间的链接跳转功能
// 数据来源：IATA Reference Manual for Audit Programs (IRM) Edition 13
// 更新时间: 2023-04-01 (IRM Ed. 13 生效日期)

module.exports = [
  {
    id: "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
    chinese_name: "异常活动 (IEnvA)",
    english_name: "Abnormal Activities (IEnvA)",
    definition: "很少发生但已计划的关机和启动条件或活动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2c3d4e5-f6g7-4h8i-9j0k-l1m2n3o4p5q6",
    chinese_name: "可接受的安全绩效水平 (ALoSP)",
    english_name: "Acceptable Level of Safety Performance (ALoSP)",
    definition: "一个国家在其国家安全计划(State Safety Program (SSP))中定义的民用航空最低安全绩效水平，或服务提供商在其安全管理系统中定义的最低安全绩效水平，以安全绩效指标(SPIs)(Safety Performance Indicator (SPI))和安全绩效目标(SPTs)(Safety Performance Target (SPT))的形式表达。",
    equivalent_terms: "",
    see_also: "Safety Performance Indicator (SPI), Safety Performance Target (SPT), State Safety Program (SSP)",
    see_also_array: ["Safety Performance Indicator (SPI)", "Safety Performance Target (SPT)", "State Safety Program (SSP)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3d4e5f6-g7h8-4i9j-0k1l-m2n3o4p5q6r7",
    chinese_name: "接受（国家或当局）",
    english_name: "Acceptance (State or Authority)",
    definition: "参见：国家接受(State Acceptance)。",
    equivalent_terms: "",
    see_also: "State Acceptance",
    see_also_array: ["State Acceptance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4e5f6g7-h8i9-4j0k-1l2m-n3o4p5q6r7s8",
    chinese_name: "事故（航空器）",
    english_name: "Accident (Aircraft)",
    definition: "与航空器运行相关的事件，发生在任何人为了飞行目的登上航空器到所有这些人员下机之间的时间内，在此期间有人员死亡或重伤、航空器遭受重大损坏，或航空器失踪或完全无法进入。",
    equivalent_terms: "Aircraft Accident, Hull Loss",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5f6g7h8-i9j0-4k1l-2m3n-o4p5q6r7s8t9",
    chinese_name: "事故数据交换",
    english_name: "Accident Data eXchange",
    definition: "事故数据交换(ADX)是为航空安全专业人员和研究人员提供的商业航空事故存储库。",
    equivalent_terms: "ADX",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6g7h8i9-j0k1-4l2m-3n4o-p5q6r7s8t9u0",
    chinese_name: "问责制",
    english_name: "Accountability",
    definition: "接受决策和政策最终责任的义务，以及对适用功能、职责、任务或行动绩效的义务；意味着对确保此类责任得到执行或履行负有责任。问责制不可委托。\n注：在安全管理系统(Safety Management System)的背景下，问责制意味着对安全绩效承担最终责任，无论是在整体SMS级别（负责任高管(Accountable Executive)）还是在特定产品和/或流程级别（管理层的其他适用成员）。",
    equivalent_terms: "",
    see_also: "Accountable Executive, Responsibility, Safety Management System",
    see_also_array: ["Accountable Executive", "Responsibility", "Safety Management System"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7h8i9j0-k1l2-4m3n-4o5p-q6r7s8t9u0v1",
    chinese_name: "负责任高管 (AE)",
    english_name: "Accountable Executive (AE)",
    definition: "由组织指定的单一、可识别的高级管理官员，负责组织管理系统的运行绩效。\n注：此IOSA/ISSA/ISAGO定义中使用的术语'组织'可能指运营人、地面服务提供商、审计组织、ISAGO代理商或认可的培训组织。\n参见：问责制(Accountability)。",
    equivalent_terms: "AE",
    see_also: "Accountability",
    see_also_array: ["Accountability"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8i9j0k1-l2m3-4n4o-5p6q-r7s8t9u0v1w2",
    chinese_name: "ACMI租赁协议",
    english_name: "ACMI Lease Agreement",
    definition: "一种飞机租赁安排，其中一个运营人（出租人）向另一个运营人（承租人）提供飞机、机组、维护和保险（ACMI）。承租人负责燃料、机场、飞越和其他相关费用，并按运营小时付费。出租人对根据租赁协议进行的飞行行使运营控制权。\n参见：湿租协议(Damp Lease Agreement), 全服务湿租协议(Wet Lease Agreement)。",
    equivalent_terms: "",
    see_also: "Damp Lease Agreement, Wet Lease Agreement",
    see_also_array: ["Damp Lease Agreement", "Wet Lease Agreement"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9j0k1l2-m3n4-4o5p-6q7r-s8t9u0v1w2x3",
    chinese_name: "行动文件",
    english_name: "Action Document",
    definition: "由技术服务部门或工程部门发出的工程指令、工程订单、工程请求或特别指令，用于定义运营人或AMO因适航服务文献（如ADs、SBs）而产生的要求。",
    equivalent_terms: "Engineering Order (EO), Engineering Instruction (EI), Engineering Request (ER)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j0k1l2m3-n4o5-4p6q-7r8s-t9u0v1w2x3y4",
    chinese_name: "主动实施",
    english_name: "Active Implementation",
    definition: "通过接受实施行动计划(IAP)来达到与指定的IOSA和/或ISAGO条款一致性的一种方式。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1l2m3n4-o5p6-4q7r-8s9t-u0v1w2x3y4z5",
    chinese_name: "非法干扰行为",
    english_name: "Acts of Unlawful Interference",
    definition: "任何可能危及民用航空安全的行为或企图行为，包括但不限于：\n• 非法劫持飞机；\n• 破坏使用中的飞机；\n• 在飞机上或机场劫持人质；\n• 强行闯入飞机、机场或相关民航设施；\n• 为犯罪目的在飞机上或机场引入武器、危险装置或材料；\n• 利用使用中的飞机造成死亡、重伤或对财产或环境造成严重损害；\n• 传播虚假信息，危及飞行中或地面上的飞机安全，或危及机场或相关民航设施内的乘客、机组人员、地勤人员或公众的安全。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2m3n4o5-p6q7-4r8s-9t0u-v1w2x3y4z5a6",
    chinese_name: "适应性任务列表",
    english_name: "Adaptive Task Lists",
    definition: "危险品规则(DGR)附录H中包含的指南，提供了在货物和旅客操作流程中通常执行的明确定义功能的示例，这些功能需要进行危险品培训。此类指南描述了每个功能，并提供了在任务、子任务、性能和预期熟练程度方面的建议要求，以便安全地执行这些功能。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3n4o5p6-q7r8-4s9t-0u1v-w2x3y4z5a6b7",
    chinese_name: "高级资格认证计划 (AQP)",
    english_name: "Advanced Qualification Program (AQP)",
    definition: "一种培训和评估计划，是遵守监管机构规定的传统培训要求的替代方法。此类高级或替代性培训和评估计划通常是为了在批准创新培训计划方面提供更大的灵活性，并可用于资格认证和认证（如适用）飞行机组成员、客舱机组成员、飞行签派员/飞行运行官员(FOOs)、教员、评估员及其他运行人员。\n参见：替代培训和资格认证计划(Alternative Training and Qualification Program (ATQP)), 实证训练(Evidence Based Training)。",
    equivalent_terms: "",
    see_also: "Alternative Training and Qualification Program (ATQP), Evidence Based Training",
    see_also_array: ["Alternative Training and Qualification Program (ATQP)", "Evidence Based Training"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4o5p6q7-r8s9-4t0u-1v2w-x3y4z5a6b7c8",
    chinese_name: "咨询通告 (AC)",
    english_name: "Advisory Circular (AC)",
    definition: "由当局发布的信息，提供适用的指导和/或描述对飞机运行的变更（例如改进）及其完成方式。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5p6q7r8-s9t0-4u1v-2w3x-y4z5a6b7c8d9",
    chinese_name: "航行资料汇编 (AIP)",
    english_name: "Aeronautical Information Publications (AIP)",
    definition: "由国家发布或经国家授权发布的出版物，包含对空中航行至关重要的持久性航行信息。它被设计成一本手册，包含与在特定国家飞行飞机相关的法规、程序和其他信息的详尽细节。通常由各自的民航管理部门发布或代表其发布。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6q7r8s9-t0u1-4v2w-3x4y-z5a6b7c8d9e0",
    chinese_name: "航空产品",
    english_name: "Aeronautical Product",
    definition: "任何专门为安装在飞机、发动机或部件上而制造的材料、化合物、液体、组件或零件。",
    equivalent_terms: "Consumable, Aircraft Part, Aircraft Component",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7r8s9t0-u1v2-4w3x-4y5z-a6b7c8d9e0f1",
    chinese_name: "航空货运价规则 (TACT)",
    english_name: "Air Cargo Tariff and Rules (TACT)",
    definition: "由IATA发布和维护的参考数据库，旨在为行业提供有关航空货物运输的规则、费率、附加费的最新信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8s9t0u1-v2w3-4x4y-5z6a-b7c8d9e0f1g2",
    chinese_name: "航空运营人",
    english_name: "Air Operator",
    definition: "持有由当局颁发的航空运营人证书(Air Operator Certificate (AOC))的持有人。",
    equivalent_terms: "Airline, Air Carrier, Operator, AOC Holder",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9t0u1v2-w3x4-4y5z-6a7b-c8d9e0f1g2h3",
    chinese_name: "航空运营人证书 (AOC)",
    english_name: "Air Operator Certificate (AOC)",
    definition: "授权运营人进行特定商业航空运输业务的证书。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0u1v2w3-x4y5-4z6a-7b8c-d9e0f1g2h3i4",
    chinese_name: "航空运营人安保计划 (AOSP)",
    english_name: "Air Operator Security Program (AOSP)",
    definition: "为保障国际民用航空免遭非法干扰行为而采纳的要求和/或标准的计划。AOSP符合国家和运营所在国民航安保当局的要求。\n注：地面服务提供商的安保计划符合其客户航空公司的AOSP和运营所在国民航安保当局的要求。",
    equivalent_terms: "Airline Security Program, Air Carrier Security Plan (ACSP)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1v2w3x4-y5z6-4a7b-8c9d-e0f1g2h3i4j5",
    chinese_name: "空中报告 (AIREP)",
    english_name: "Air-report (AIREP)",
    definition: "飞行中的飞机根据ICAO对位置、运行和/或气象报告的要求编写的报告。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2w3x4y5-z6a7-4b8c-9d0e-f1g2h3i4j5k6",
    chinese_name: "空中交通管制 (ATC)",
    english_name: "Air Traffic Control (ATC)",
    definition: "为控制飞机活动而提供的服务，其方式为：\n• 防止碰撞：\n  – 飞机之间；\n  – 在机动区域内飞机与障碍物之间。\n• 加速并维持有序的空中交通流。",
    equivalent_terms: "Air Traffic Control Service",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3x4y5z6-a7b8-4c9d-0e1f-g2h3i4j5k6l7",
    chinese_name: "空中交通管理 (ATM)",
    english_name: "Air Traffic Management (ATM)",
    definition: "为提供飞机在空中和地面上的安全移动而对空中交通和空域进行的综合管理。ATM包括三个互补的系统：\n• 空域管理；\n• 空中交通流量和容量管理；\n• 空中交通管制(Air Traffic Control (ATC))。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4y5z6a7-b8c9-4d0e-1f2g-h3i4j5k6l7m8",
    chinese_name: "空中交通服务 (ATS)",
    english_name: "Air Traffic Services (ATS)",
    definition: "一个通用术语，统指飞行情报服务、告警服务、空中交通咨询服务、空中交通管制服务（区域管制服务、进近管制服务和机场管制服务）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5z6a7b8-c9d0-4e1f-2g3h-i4j5k6l7m8n9",
    chinese_name: "机载防撞系统 (ACAS)",
    english_name: "Airborne Collision Avoidance System (ACAS)",
    definition: "一种基于二次监视雷达(SSR)应答器信号的飞机系统，它独立于地面设备运行，向飞行员提供关于可能与其冲突并配备了SSR应答器的飞机的建议。",
    equivalent_terms: "Traffic Collision Avoidance System (TCAS)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6a7b8c9-d0e1-4f2g-3h4i-j5k6l7m8n9o0",
    chinese_name: "机载防撞系统 II (ACAS II)",
    english_name: "Airborne Collision Avoidance System II (ACAS II)",
    definition: "一种机载防撞系统(ACAS)，除了提供交通咨询外，还提供垂直分辨率咨询。\n参见：机载防撞系统(Airborne Collision Avoidance System (ACAS))。",
    equivalent_terms: "Traffic Collision Avoidance System II (TCAS II)",
    see_also: "Airborne Collision Avoidance System (ACAS)",
    see_also_array: ["Airborne Collision Avoidance System (ACAS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7b8c9d0-e1f2-4g3h-4i5j-k6l7m8n9o0p1",
    chinese_name: "机载风切变告警系统",
    english_name: "Airborne Wind Shear Warning System",
    definition: "飞机上用于识别风切变存在的设备。\n参见：前视风切变告警系统(Forward-looking Wind Shear Warning System), 风切变(Wind Shear)。",
    equivalent_terms: "",
    see_also: "Forward-looking Wind Shear Warning System, Wind Shear",
    see_also_array: ["Forward-looking Wind Shear Warning System", "Wind Shear"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8c9d0e1-f2g3-4h4i-5j6k-l7m8n9o0p1q2",
    chinese_name: "航空器",
    english_name: "Aircraft",
    definition: "任何能够依靠空气的反作用力而在大气中获得支撑的机器，而不是依靠空气对地球表面的反作用力。例如飞机、直升机、水上飞机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9d0e1f2-g3h4-4i5j-6k7l-m8n9o0p1q2r3",
    chinese_name: "航空器入口门",
    english_name: "Aircraft Access Doors",
    definition: "提供进入客舱或下层货舱的门，可以通过手动、电动、液压或气动方式操作。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0e1f2g3-h4i5-4j6k-7l8m-n9o0p1q2r3s4",
    chinese_name: "航空器部件",
    english_name: "Aircraft Component",
    definition: "飞机的任何零件或设备，当安装在飞机上或在飞机上提供时，如果其不健全或功能不正常，可能会影响飞机、其乘员或货物的安全，或导致飞机对人或财产构成危险；或漂浮设备、疏散设备、食品包、便携式呼吸设备、消防设备或任何其他为紧急情况使用而安装在飞机上或提供的设备或器具。",
    equivalent_terms: "Aircraft Part, Component, Part",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1f2g3h4-i5j6-4k7l-8m9n-o0p1q2r3s4t5",
    chinese_name: "航空器地面活动",
    english_name: "Aircraft Ground Movement",
    definition: "与飞机在地面上移动相关的操作，包括飞机滑行、后推、动力后退、动力推出（动力进入）或飞机拖曳。\n参见：航空器后推(Aircraft Pushback), 航空器动力后推(Aircraft Powerback), 航空器动力推出(动力进入)(Aircraft Power-out (Power-in)), 航空器拖曳(Aircraft Towing)。",
    equivalent_terms: "",
    see_also: "Aircraft Pushback, Aircraft Powerback, Aircraft Power-out (Power-in), Aircraft Towing",
    see_also_array: ["Aircraft Pushback", "Aircraft Powerback", "Aircraft Power-out (Power-in)", "Aircraft Towing"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2g3h4i5-j6k7-4l8m-9n0o-p1q2r3s4t5u6",
    chinese_name: "航空器地面保障",
    english_name: "Aircraft Handling",
    definition: "与飞机在地面上的服务相关的活动，包括飞机进出、设备连接和拆卸，以及在飞机紧邻区域内车辆和设备的操作。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3h4i5j6-k7l8-4m9n-0o1p-q2r3s4t5u6v7",
    chinese_name: "航空器内部区域",
    english_name: "Aircraft Interior Areas",
    definition: "隔间(Bay) - 用于装载ULD（集装箱或托盘）的货舱的细分区域，或为特定设备或目的设计的隔间（例如航空电子设备舱）。\n客舱(Cabin) - 飞机上运载乘客的区域，包括带有乘客座位和过道的区域、客舱机组人员区域、厨房、盥洗室、储物舱以及与机上乘客服务相关的其他区域。\n舱室(Compartment) - 在飞机较大空间或区域内指定的空间。\n甲板(Deck) - 一个结构化的楼层。对于只有一个结构化楼层的飞机，该楼层称为主甲板。对于有多个结构化楼层的飞机，不同楼层通常从下到上称为下甲板、主甲板和上甲板。\n驾驶舱(Flight Deck) - 位于飞机前部的区域或隔间，其中布置有飞行控制器和仪表，飞行机组人员从此控制飞机。\n货舱(Hold) - 飞机内由天花板、地板、墙壁和舱壁围成的空间，用于装载乘客以外的负载。\n区域(Section) - 飞机内一个区域或空间的细分。\n区(Zones) - 为进行重量和平衡计算而创建的飞机划分区域。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4i5j6k7-l8m9-4n0o-1p2q-r3s4t5u6v7w8",
    chinese_name: "航空器维修",
    english_name: "Aircraft Maintenance",
    definition: "为确保飞机持续适航性而执行的任务，包括大修、检查、更换、缺陷纠正以及改装或修理的任何一项或组合。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5j6k7l8-m9n0-4o1p-2q3r-s4t5u6v7w8x9",
    chinese_name: "航空器维修手册 (AMM)",
    english_name: "Aircraft Maintenance Manual (AMM)",
    definition: "由飞机制造商制作并持续更新的手册，包含与飞机、发动机和部件维修相关的程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6k7l8m9-n0o1-4p2q-3r4s-t5u6v7w8x9y0",
    chinese_name: "航空器引导",
    english_name: "Aircraft Marshalling",
    definition: "由引导员从外部对飞机移动进行的详细指挥，引导员处于能够看到飞机外部以及飞机移动路径上和邻近区域的位置。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7l8m9n0-o1p2-4q3r-4s5t-u6v7w8x9y0z1",
    chinese_name: "航空器操作手册 (AOM)",
    english_name: "Aircraft Operating Manual (AOM)",
    definition: "一份独立的或一系列手册，可能是运营手册(OM)的一部分，经运营人所在国接受，包含正常、非正常和紧急程序、检查单、限制、性能信息、飞机系统细节以及与飞机操作相关的其他材料。AOM可能包括MEL和CDL。",
    equivalent_terms: "Aeroplane Flight Manual (AFM), Aircraft Flight Manual (AFM), Company Flight Manual (CFM), Flight Crew Operating Manual (FCOM), Pilot Operating Manual",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8m9n0o1-p2q3-4r4s-5t6u-v7w8x9y0z1a2",
    chinese_name: "航空器运行",
    english_name: "Aircraft Operations",
    definition: "与飞机在地面和空中运行相关的所有活动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9n0o1p2-q3r4-4s5t-6u7v-w8x9y0z1a2b3",
    chinese_name: "航空器动力后推",
    english_name: "Aircraft Powerback",
    definition: "利用飞机发动机将飞机从停机位向后移动到滑行位置。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0o1p2q3-r4s5-4t6u-7v8w-x9y0z1a2b3c4",
    chinese_name: "航空器动力推出（动力进入）",
    english_name: "Aircraft Power-out (Power-in)",
    definition: "利用飞机发动机将飞机从（进入）停机位向前移动。",
    equivalent_terms: "Aircraft Taxi-out (taxi-in)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1p2q3r4-s5t6-4u7v-8w9x-y0z1a2b3c4d5",
    chinese_name: "航空器后推",
    english_name: "Aircraft Pushback",
    definition: "使用专用地面保障设备将飞机从停机位向后移动到滑行位置。\n• 前轮控制的后推包括拖杆法，即通过连接到前轮的拖车和拖杆来控制飞机的后退和转向；或者无拖杆法，即拖车直接连接到前轮。\n• 主轮控制的后推利用一个拖车抓住飞机主轮轮胎以提供后退移动，方向控制由驾驶舱通过使用前轮转向系统提供。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2q3r4s5-t6u7-4v8w-9x0y-z1a2b3c4d5e6",
    chinese_name: "航空器安保检查",
    english_name: "Aircraft Security Check",
    definition: "对乘客可能进入的飞机内部区域以及货舱的检查，旨在发现可疑物品、武器、爆炸物或其他危险装置、物品和物质。",
    equivalent_terms: "Pushback",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3r4s5t6-u7v8-4w9x-0y1z-a2b3c4d5e6f7",
    chinese_name: "航空器安保搜查",
    english_name: "Aircraft Security Search",
    definition: "对飞机内部和外部的彻底检查，旨在发现可疑物品、武器或其他危险/违禁装置、物品和物质。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4s5t6u7-v8w9-4x0y-1z2a-b3c4d5e6f7g8",
    chinese_name: "航空器停机位",
    english_name: "Aircraft Stand",
    definition: "停机坪上为飞机停放指定的区域。\n参见：停机坪(Apron)。",
    equivalent_terms: "Stand, Parking Stand, Parking Position",
    see_also: "Apron",
    see_also_array: ["Apron"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5t6u7v8-w9x0-4y1z-2a3b-c4d5e6f7g8h9",
    chinese_name: "航空器技术日志 (ATL)",
    english_name: "Aircraft Technical Log (ATL)",
    definition: "记录飞机机身、动力装置或设备上报告或观察到的故障、失效或缺陷的记录，包括有关修理、更换、调整或延期处理的信息。ATL通常存放在飞机上，可以是电子或纸质形式。",
    equivalent_terms: "Technical Log, Aircraft Log Book (Logbook)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6u7v8w9-x0y1-4z2a-3b4c-d5e6f7g8h9i0",
    chinese_name: "航空器拖曳",
    english_name: "Aircraft Towing",
    definition: "使用专用地面保障设备移动飞机，而非后推。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7v8w9x0-y1z2-4a3b-4c5d-e6f7g8h9i0j1",
    chinese_name: "航空器追踪",
    english_name: "Aircraft Tracking",
    definition: "由运营人建立的流程，用于在标准间隔内维护和更新飞行中单个飞机的四维位置（纬度、经度、高度、时间）的地面记录。与飞机追踪相关的术语是：\n• 4D/15 服务 - 在提供空中交通服务时，ATS单位从适当装备的飞机接收四维飞机位置信息的间隔为15分钟或更短。\n• 4D/15 追踪 - 运营人以15分钟或更短的间隔获取四维飞机位置信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8w9x0y1-z2a3-4b4c-5d6e-f7g8h9i0j1k2",
    chinese_name: "航空器过站协调员",
    english_name: "Aircraft Turnaround Coordinator",
    definition: "被授予协调实施飞机过站计划的权力和责任的合格人员。\n参见：航空器过站计划(Aircraft Turnaround Plan)。",
    equivalent_terms: "",
    see_also: "Aircraft Turnaround Plan",
    see_also_array: ["Aircraft Turnaround Plan"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9x0y1z2-a3b4-4c5d-6e7f-g8h9i0j1k2l3",
    chinese_name: "航空器过站计划",
    english_name: "Aircraft Turnaround Plan",
    definition: "详细描述飞机和旅客从抵达至离港期间（即飞机过站）地面操作活动的职责、责任和任务及其在链条中的关系，以确保此类操作的安全、安保和效率，并符合客户航空公司和相关当局的要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0y1z2a3-b4c5-4d6e-7f8g-h9i0j1k2l3m4",
    chinese_name: "航空器型号",
    english_name: "Aircraft Type",
    definition: "相同基本设计的飞机，包括所有改装，除非这些改装导致操纵、飞行特性或机组人员配置发生变化。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1z2a3b4-c5d6-4e7f-8g9h-i0j1k2l3m4n5",
    chinese_name: "航空器型号合格证",
    english_name: "Aircraft Type Certificate",
    definition: "参见：型号合格证(Type Certificate)。",
    equivalent_terms: "",
    see_also: "Type Certificate",
    see_also_array: ["Type Certificate"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2a3b4c5-d6e7-4f8g-9h0i-j1k2l3m4n5o6",
    chinese_name: "航空器改型（同型号内）",
    english_name: "Aircraft Variant (within Type)",
    definition: "就飞行机组的执照和操作而言，指同一基本认证型号的飞机，其改装不会导致操纵和/或飞行特性的重大变化，或飞行机组配置的变化，但会导致设备和/或程序的重大变化。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3b4c5d6-e7f8-4g9h-0i1j-k2l3m4n5o6p7",
    chinese_name: "飞机",
    english_name: "Airplane",
    definition: "一种动力驱动的重于空气的航空器，其升力主要由在给定飞行条件下保持固定的表面上的空气动力反作用力产生。也指由喷气发动机、火箭发动机或螺旋桨的推力向前推进的固定翼飞机。",
    equivalent_terms: "Aeroplane",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4c5d6e7-f8g9-4h0i-1j2k-l3m4n5o6p7q8",
    chinese_name: "机场地面服务手册 (AHM)",
    english_name: "Airport Handling Manual (AHM)",
    definition: "由IATA发布的定义行业标准的手册，涉及航空公司地面运营的以下领域：旅客服务、行李服务、货物和邮件服务、飞机服务和装载、载重控制、空侧管理和安全、飞机活动控制、地面服务协议、机场地面保障设备规范、地面运营环境规范。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5d6e7f8-g9h0-4i1j-2k3l-m4n5o6p7q8r9",
    chinese_name: "空侧",
    english_name: "Airside",
    definition: "机场的活动区域、邻近地形和建筑物或其部分，其进出受到控制。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6e7f8g9-h0i1-4j2k-3l4m-n5o6p7q8r9s0",
    chinese_name: "空侧安全培训",
    english_name: "Airside Safety Training",
    definition: "旨在确保人员在机场空侧区域执行职责时达到可接受的安全水平的培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7f8g9h0-i1j2-4k3l-4m5n-o6p7q8r9s0t1",
    chinese_name: "适航性",
    english_name: "Airworthiness",
    definition: "飞机、发动机、螺旋桨或部件处于适航状态。\n参见：适航(Airworthy)。",
    equivalent_terms: "",
    see_also: "Airworthy",
    see_also_array: ["Airworthy"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8g9h0i1-j2k3-4l4m-5n6o-p7q8r9s0t1u2",
    chinese_name: "适航证",
    english_name: "Airworthiness Certificate",
    definition: "参见：适航证书(Certificate of Airworthiness)。",
    equivalent_terms: "",
    see_also: "Certificate of Airworthiness",
    see_also_array: ["Certificate of Airworthiness"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9h0i1j2-k3l4-4m5n-6o7p-q8r9s0t1u2v3",
    chinese_name: "适航数据",
    english_name: "Airworthiness Data",
    definition: "确保飞机或飞机部件能够维持在一定状态所需的信息，以保证飞机或相关操作和应急设备的可用性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0i1j2k3-l4m5-4n6o-7p8q-r9s0t1u2v3w4",
    chinese_name: "适航指令 (AD)",
    english_name: "Airworthiness Directive (AD)",
    definition: "由国家航空当局(NAA)发布的指令，要求在特定时间范围内对指定的飞机、发动机或部件采取具体措施。AD通常是为解决当前或可能的缺陷而发布的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1j2k3l4-m5n6-4o7p-8q9r-s0t1u2v3w4x5",
    chinese_name: "适航放行",
    english_name: "Airworthiness Release",
    definition: "根据适用当局的规定，对特定检查（例如服务检查、‘A’检、‘C’检、‘D’检、30K检、特殊检查、发动机更换、重大修理或重大改装）完成的认证。",
    equivalent_terms: "Certificated Release to Service, Release to Service",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2k3l4m5-n6o7-4p8q-9r0s-t1u2v3w4x5y6",
    chinese_name: "适航",
    english_name: "Airworthy",
    definition: "对飞机、发动机、螺旋桨或部件的描述，其符合批准的设计并且处于安全运行状态。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3l4m5n6-o7p8-4q9r-0s1t-u2v3w4x5y6z7",
    chinese_name: "警告服务通告",
    english_name: "Alert Service Bulletin",
    definition: "当存在制造商认为与安全相关的状况时（相对于产品改进），由制造商发布的文件。\n参见：服务通告(Service Bulletin)。",
    equivalent_terms: "",
    see_also: "Service Bulletin",
    see_also_array: ["Service Bulletin"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4m5n6o7-p8q9-4r0s-1t2u-v3w4x5y6z7a8",
    chinese_name: "全货机",
    english_name: "All-cargo Aircraft",
    definition: "专门为运输货物而设计的飞机。",
    equivalent_terms: "Freighter",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5n6o7p8-q9r0-4s1t-2u3v-w4x5y6z7a8b9",
    chinese_name: "备降机场",
    english_name: "Alternate Airport",
    definition: "当飞往或降落在预定着陆机场变得不可能或不适宜时，飞机可以前往的机场。备降机场包括以下几种：\n起飞备降场–当无法返回起飞机场时，飞机在起飞后不久可以降落的备降机场。\n航路备降场–飞机在航路中遇到意外的非正常或紧急情况后能够降落的机场。\nETOPS航路备降场–在ETOPS运行中，飞机在航路中遇到发动机停车或其他非正常或紧急情况后能够降落的合适且适当的备降机场。\n目的地备降场–当飞往或降落在预定着陆机场变得不可能或不适宜时，飞机可以前往并能够降落的备降机场。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6o7p8q9-r0s1-4t2u-3v4w-x5y6z7a8b9c0",
    chinese_name: "替代培训和资格认证计划 (ATQP)",
    english_name: "Alternative Training and Qualification Program (ATQP)",
    definition: "用于认证和鉴定飞行机组成员的高级或替代性培训和评估计划。\n参见：实证训练(Evidence Based Training), 高级资格认证计划(Advanced Qualification Program (AQP))。",
    equivalent_terms: "",
    see_also: "Evidence Based Training, Advanced Qualification Program (AQP)",
    see_also_array: ["Evidence Based Training", "Advanced Qualification Program (AQP)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7p8q9r0-s1t2-4u3v-4w5x-y6z7a8b9c0d1",
    chinese_name: "高度偏差",
    english_name: "Altitude Deviation",
    definition: "任何偏离指定高度或飞行高度层的行为。",
    equivalent_terms: "Altitude Bust, Level Bust, Altitude Acquisition Error",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8q9r0s1-t2u3-4v4w-5x6y-z7a8b9c0d1e2",
    chinese_name: "高度表参考设置",
    english_name: "Altimeter Reference Setting",
    definition: "气压高度表为指示操作区域所需的规定高度而设置的参考值。\nQNH–源自某台站的高度表设置，该设置将使气压高度表指示该台站上方的平均海平面高度。\nQFE–源自某台站的高度表设置，该设置将使气压高度表指示该台站上方的高度。\nQNE–ISA标准压力1013.2 hPa或29.92英寸汞柱的高度表设置。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9r0s1t2-u3v4-4w5x-6y7z-a8b9c0d1e2f3",
    chinese_name: "预期运行条件",
    english_name: "Anticipated Operating Conditions",
    definition: "在飞机设计中用于确定或确保飞机在所有预期运行中满足适航性要求（在操纵性和机动性方面）的条件；指根据经验已知或在飞机运行寿命期间可合理预见的条件，并考虑到飞机合格的运行。考虑的条件是与大气气象状态、地形构造、飞机功能、人员效率以及所有影响飞行安全的因素相关的条件。预期运行条件不包括：\n• 那些可以通过操作程序有效避免的极端情况，以及\n• 那些发生频率极低，以至于要求在这些极端情况下满足标准会带来比经验证明必要和实用的更高水平的适航性的情况。\n参见：适航证书(Certificate of Airworthiness (CoA))。",
    equivalent_terms: "",
    see_also: "Certificate of Airworthiness (CoA)",
    see_also_array: ["Certificate of Airworthiness (CoA)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0s1t2u3-v4w5-4x6y-7z8a-b9c0d1e2f3g4",
    chinese_name: "防撞灯",
    english_name: "Anti-Collision Lights",
    definition: "在飞行中或在机场活动区运行的飞机需要显示的灯光，旨在为另一架飞机的驾驶员或地面人员提供尽可能多的时间来解释和采取必要的机动以避免碰撞。(附件8)\n注：为其他目的安装的灯光，如着陆灯和机身泛光灯，可以除了《适航手册》第二卷(Doc 9760)中规定的防撞灯之外使用，以增强飞机的显眼度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1t2u3v4-w5x6-4y7z-8a9b-c0d1e2f3g4h5",
    chinese_name: "防冰",
    english_name: "Anti-Icing",
    definition: "一种预防性过程，用于在有限时间内保护清洁的飞机表面免受冰和霜的形成以及雪和融雪的积聚。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2u3v4w5-x6y7-4z8a-9b0c-d1e2f3g4h5i6",
    chinese_name: "审计组织警报 (AO Alert)",
    english_name: "AO Alert",
    definition: "一份编号文件，用于向审计组织传达紧急的IOSA/ISSA计划问题，以供立即参考和采取行动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3v4w5x6-y7z8-4a9b-0c1d-e2f3g4h5i6j7",
    chinese_name: "审计组织公告 (AO Bulletin)",
    english_name: "AO Bulletin",
    definition: "一份编号文件，用于向审计组织传达IOSA/ISSA计划问题以供参考。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4w5x6y7-z8a9-4b0c-1d2e-f3g4h5i6j7k8",
    chinese_name: "审计组织会议 (AO Meeting)",
    english_name: "AO Meeting",
    definition: "由IATA组织并由审计组织及其他受邀方参加的会议，旨在讨论和标准化IOSA计划。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5x6y7z8-a9b0-4c1d-2e3f-g4h5i6j7k8l9",
    chinese_name: "进近禁止点",
    english_name: "Approach Ban Point",
    definition: "仪表进近不得继续到机场标高/水平以上300米（1000英尺）以下或进入最后进近段的点，除非报告的能见度或控制性RVR高于机场运行最低标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6y7z8a9-b0c1-4d2e-3f4g-h5i6j7k8l9m0",
    chinese_name: "稳定进近门",
    english_name: "Approach Stabilization Gates",
    definition: "沿最后进近段定义的点，以机场上方的最低高度表示，每个点都有定义的稳定进近标准，飞机必须满足这些标准才能被认为是稳定的进近。\n参见：稳定进近(Stabilized Approach), 稳定进近标准(Stabilized Approach Criteria)。",
    equivalent_terms: "",
    see_also: "Stabilized Approach, Stabilized Approach Criteria",
    see_also_array: ["Stabilized Approach", "Stabilized Approach Criteria"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7z8a9b0-c1d2-4e3f-4g5h-i6j7k8l9m0n1",
    chinese_name: "批准（危险品）",
    english_name: "Approval (Dangerous Goods)",
    definition: "由相应国家当局授予的授权，用于：\n• 在危险品条例(Dangerous Goods Regulations (DGR))规定货物可以在获得批准的情况下运输时，运输在客机和/或货机上禁止运输的危险品，或\n• 危险品条例(DGR)中规定的其他目的。\n参见：危险品条例(Dangerous Goods Regulations (DGR))。",
    equivalent_terms: "",
    see_also: "Dangerous Goods Regulations (DGR)",
    see_also_array: ["Dangerous Goods Regulations (DGR)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8a9b0c1-d2e3-4f4g-5h6i-j7k8l9m0n1o2",
    chinese_name: "批准（国家或当局）",
    english_name: "Approval (State or Authority)",
    definition: "参见：国家批准(State Approval)。",
    equivalent_terms: "",
    see_also: "State Approval",
    see_also_array: ["State Approval"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9b0c1d2-e3f4-4g5h-6i7j-k8l9m0n1o2p3",
    chinese_name: "批准的数据",
    english_name: "Approved Data",
    definition: "已经由适用的国家航空当局(NAA)批准的数据；包括：\n• 直接适用的制造商手册和程序信息；\n• 已经由运营人的工程支持部门为适用性和兼容性审核通过的外部来源的适航信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0c1d2e3-f4g5-4h6i-7j8k-l9m0n1o2p3q4",
    chinese_name: "批准的飞行手册 (AFM)",
    english_name: "Approved Flight Manual (AFM)",
    definition: "由飞机制造商制作并由适用的民航局(CAA)批准的某类型飞机的操作手册，包含特定于该飞机类型的操作数据、规格、限制、程序和信息。",
    equivalent_terms: "Aircraft Flight Manual (AFM), Airplane Flight Manual (AFM), Aeroplane Flight Manual (AFM), Aircraft Operating Manual (AOM), Flight Crew Operations Manual (FCOM)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1d2e3f4-g5h6-4i7j-8k9l-m0n1o2p3q4r5",
    chinese_name: "批准的维修组织 (AMO)",
    english_name: "Approved Maintenance Organization (AMO)",
    definition: "已经获得某国国家航空当局(NAA)批准，可对飞机、发动机和部件进行特定维修的维修组织。此类批准：\n• 可以记录在NAA向维修组织颁发的独立/单独证书中（例如，EASA根据Part-145颁发的维修组织批准证书，或FAA根据14CFR145颁发的修理站证书），或者可以由NAA批准并作为维修组织所属的另一证书的组成部分记录（例如，航空承运人证书或运营证书的持有人，条件是符合Part 121规则，并因此遵守14CFR121的L分部）。\n• 在证书、其附件或同等文件中，规定了维修组织的批准范围以及相关的特权和限制。",
    equivalent_terms: "Maintenance organization, Maintenance Provider, Principal Maintenance Provider, Repair Station",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2e3f4g5-h6i7-4j8k-9l0m-n1o2p3q4r5s6",
    chinese_name: "批准的维修大纲",
    english_name: "Approved Maintenance Program",
    definition: "由原始设备制造商和/或适用的国家航空当局(NAA)批准的计划，规定了飞机、发动机和部件所需的维修和维修间隔。\n注：当飞机从不同于运营国的国家注册时，应由注册国批准并由运营国接受。",
    equivalent_terms: "Maintenance Program, Aircraft Maintenance Program, Maintenance Planning Document (MPD)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3f4g5h6-i7j8-4k9l-0m1n-o2p3q4r5s6t7",
    chinese_name: "批准的维修计划表",
    english_name: "Approved Maintenance Schedule",
    definition: "参见：批准的维修大纲(Approved Maintenance Program)。",
    equivalent_terms: "",
    see_also: "Approved Maintenance Program",
    see_also_array: ["Approved Maintenance Program"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4g5h6i7-j8k9-4l0m-1n2o-p3q4r5s6t7u8",
    chinese_name: "停机坪",
    english_name: "Apron",
    definition: "机场上为飞机装卸旅客或货物、加油、停放或维修而设定的区域。",
    equivalent_terms: "Ramp",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5h6i7j8-k9l0-4m1n-2o3p-q4r5s6t7u8v9",
    chinese_name: "区域导航 (RNAV)",
    english_name: "Area Navigation (RNAV)",
    definition: "一种导航方法，允许飞机在地面或天基导航辅助设备的覆盖范围内，或在自备导航设备的能力范围内，或这些设备的组合下，沿任何期望的飞行路径运行。\n参见：导航规范(Navigation Specification)。",
    equivalent_terms: "",
    see_also: "Navigation Specification",
    see_also_array: ["Navigation Specification"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6i7j8k9-l0m1-4n2o-3p4q-r5s6t7u8v9w0",
    chinese_name: "磁场不可靠区域 (AMU)",
    english_name: "Areas of Magnetic Unreliability (AMU)",
    definition: "位于北极或南极附近的空域，由于极地磁场和经线的紧密性，飞机位置的微小变化会导致真航向/航迹的快速变化。在这些区域的运行通常需要特殊设备和机组培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7j8k9l0-m1n2-4o3p-4q5r-s6t7u8v9w0x1",
    chinese_name: "第83条之二",
    english_name: "Article 83 bis",
    definition: "《国际民用航空公约》（芝加哥公约）的一条款，规定在飞机租赁、包机或交换或类似安排的情况下，通常由飞机注册国承担的某些职能和责任可以转移给飞机运营人的主要营业地所在国，或者如果运营人没有这样的营业地，则转移给其永久居住地所在国。\n注：上述定义中的“另一国”指的是商业航空运输的运营人所在国。\n参见：第83条之二协议(Article 83 bis Agreement), 第83条之二协议摘要(Article 83 bis Agreement Summary)。",
    equivalent_terms: "",
    see_also: "Article 83 bis Agreement, Article 83 bis Agreement Summary",
    see_also_array: ["Article 83 bis Agreement", "Article 83 bis Agreement Summary"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8k9l0m1-n2o3-4p4q-5r6s-t7u8v9w0x1y2",
    chinese_name: "第83条之二协议",
    english_name: "Article 83 bis Agreement",
    definition: "两个缔约国之间向国际民航组织理事会注册的协议，规定根据第83条之二的规定，将某些职责和职能从注册国转移给运营人所在国。\n参见：第83条之二(Article 83 bis), 第83条之二协议摘要(Article 83 bis Agreement Summary)。",
    equivalent_terms: "",
    see_also: "Article 83 bis, Article 83 bis Agreement Summary",
    see_also_array: ["Article 83 bis", "Article 83 bis Agreement Summary"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9l0m1n2-o3p4-4q5r-6s7t-u8v9w0x1y2z3",
    chinese_name: "第83条之二协议摘要",
    english_name: "Article 83 bis Agreement Summary",
    definition: "当飞机在注册国与另一国之间的第83条之二协议下运行时，该协议摘要是与在国际民航组织理事会注册的第83条之二协议一同传送的文件，简明清晰地指明了注册国向运营人所在国转移了哪些职能和职责。\n注：国际民航组织附件6，修正案44，附录10提出了一个协调的协议摘要模板，其中包含了所有相关信息，并为运营人提供了一个简单的表格，用于在停机坪检查或其他核查活动中，当第83条之二协议适用于被检查的飞机时，减轻误解。\n参见：第83条之二(Article 83 bis), 第83条之二协议(Article 83 bis Agreement)。",
    equivalent_terms: "",
    see_also: "Article 83 bis, Article 83 bis Agreement",
    see_also_array: ["Article 83 bis", "Article 83 bis Agreement"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0m1n2o3-p4q5-4r6s-7t8u-v9w0x1y2z3a4",
    chinese_name: "评估",
    english_name: "Assessment",
    definition: "确定候选人/产品/服务是否满足能力标准的行为。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1n2o3p4-q5r6-4s7t-8u9v-w0x1y2z3a4b5",
    chinese_name: "评估工具",
    english_name: "Assessment Tool",
    definition: "与ISM中某些条款相关的详细流程，由审计员用于评估条款实施的有效性；工具包括期望结果、适用性标准和有效性标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2o3p4q5-r6s7-4t8u-9v0w-x1y2z3a4b5c6",
    chinese_name: "ATS飞行计划",
    english_name: "ATS Flight Plan",
    definition: "就预定飞行或部分预定飞行向空中交通服务(ATS)单位提供的特定信息。",
    equivalent_terms: "Air Traffic Services (ATS), ATC Flight Plan",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3p4q5r6-s7t8-4u9v-0w1x-y2z3a4b5c6d7",
    chinese_name: "审计（评估）",
    english_name: "Audit (Assessment)",
    definition: "为获取和评估证据，以确定与特定标准、规则、法规或其他适用要求的符合程度的结构化、独立和客观的过程。\n注：“审计”(Audit)一词特指在IOSA或ISAGO计划下对运营人或提供商进行的审计；而“审计”(audit)一词是通用的，指任何审计。\n注：在ISSA计划下，使用“评估”(Assessment)一词代替“审计”(Audit)。\n参见：初次审计(Initial Audit), 内部审计(Internal Audit), IOSA计划(IOSA Program), 质量审计(Quality Audit), 更新审计(Renewal Audit), 安全审计(Safety Audit), 验证审计(Verification Audit)。",
    equivalent_terms: "",
    see_also: "Initial Audit, Internal Audit, IOSA Program, Quality Audit, Renewal Audit, Safety Audit, Verification Audit",
    see_also_array: ["Initial Audit", "Internal Audit", "IOSA Program", "Quality Audit", "Renewal Audit", "Safety Audit", "Verification Audit"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4q5r6s7-t8u9-4v0w-1x2y-z3a4b5c6d7e8",
    chinese_name: "审计结束",
    english_name: "Audit Closure",
    definition: "在审计（评估）过程中，当所有发现项都已由运营人/提供商关闭，并且此类关闭已得到验证时，由审计组织或ISAGO主任审计员执行的行政措施。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5r6s7t8-u9v0-4w1x-2y3z-a4b5c6d7e8f9",
    chinese_name: "审计结论",
    english_name: "Audit Conclusions",
    definition: "作为审计（评估）的结果，由运营人/提供商确定的与ISARPs或GOSARPs的符合性或不符合性。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6s7t8u9-v0w1-4x2y-3z4a-b5c6d7e8f9g0",
    chinese_name: "审计漏斗",
    english_name: "Audit Funnel",
    definition: "由审计组织向IATA提交的报告，提供有关IOSA/ISSA下所有审计活动安排和状态的详细信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7t8u9v0-w1x2-4y3z-4a5b-c6d7e8f9g0h1",
    chinese_name: "审计反馈调查",
    english_name: "Audit Feedback Survey",
    definition: "一个为运营人/提供商提供向IATA提交关于IOSA/ISSA/ISAGO下审计执行情况的详细、保密反馈的计划。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8u9v0w1-x2y3-4z4a-5b6c-d7e8f9g0h1i2",
    chinese_name: "审计目标",
    english_name: "Audit Objective(s)",
    definition: "期望通过进行审计达成的有形成就，通常以意图声明的形式表达。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9v0w1x2-y3z4-4a5b-6c7d-e8f9g0h1i2j3",
    chinese_name: "审计组织 (AO)",
    english_name: "Audit Organization (AO)",
    definition: "经IATA认可，作为IOSA/ISSA计划下审计服务提供者的组织。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0w1x2y3-z4a5-4b6c-7d8e-f9g0h1i2j3k4",
    chinese_name: "审计计划",
    english_name: "Audit Plan",
    definition: "为实施和完成审计（评估）而制定的详细行动计划。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1x2y3z4-a5b6-4c7d-8e9f-g0h1i2j3k4l5",
    chinese_name: "审计过程",
    english_name: "Audit Process",
    definition: "与审计（评估）相关的全部程序和活动过程。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2y3z4a5-b6c7-4d8e-9f0g-h1i2j3k4l5m6",
    chinese_name: "审计大纲",
    english_name: "Audit Program",
    definition: "由审计组织(AO)或ISAGO代理(GOA)用于在IOSA/ISSA或ISAGO下提供审计服务的书面管理、组织、策略、政策和程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3z4a5b6-c7d8-4e9f-0g1h-i2j3k4l5m6n7",
    chinese_name: "审计范围",
    english_name: "Audit Scope",
    definition: "IOSA/ISSA下的审计（评估）范围，包括以下ISM/ISSM学科中的标准和建议做法中包含的规范：\n• 组织和管理系统 (ORG)\n• 飞行运行 (FLT)\n• 运行控制和飞行签派 (DSP)\n• 飞机工程和维修 (MNT)\n• 客舱运行 (CAB)\n• 地面保障运行 (GRH)\n• 货物运行 (CGO)\n• 安保管理 (SEC)\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4a5b6c7-d8e9-4f0g-1h2i-j3k4l5m6n7o8",
    chinese_name: "审计范围 (ISAGO)",
    english_name: "Audit Scope (ISAGO)",
    definition: "ISAGO下的审计范围，包括以下GOSM学科中的标准和建议做法中包含的规范：\n• 组织和管理 (ORM)\n• 载重控制 (LOD)\n• 旅客和行李服务 (PAB)\n• 飞机装卸 (HDL)\n• 飞机地面活动 (AGM)\n• 货物和邮件服务 (CGM)",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5b6c7d8-e9f0-4g1h-2i3j-k4l5m6n7o8p9",
    chinese_name: "审计共享",
    english_name: "Audit Sharing",
    definition: "在IOSA/ISSA或ISAGO下，有利害关系的方利用对某一运营人或提供商的审计（评估）来满足其自身对同一运营人或提供商的审计需求的过程。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6c7d8e9-f0g1-4h2i-3j4k-l5m6n7o8p9q0",
    chinese_name: "审计组",
    english_name: "Audit Team",
    definition: "协调并共同进行审计（评估）的审计员小组。\n参见：审计（评估）(Audit (Assessment))。",
    equivalent_terms: "",
    see_also: "Audit (Assessment)",
    see_also_array: ["Audit (Assessment)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7d8e9f0-g1h2-4i3j-4k5l-m6n7o8p9q0r1",
    chinese_name: "受审方",
    english_name: "Auditee",
    definition: "一个通用术语，指接受审计的任何实体、个人或活动。\n注：在IOSA/ISSA下，运营人是受审方；在ISAGO下，提供商是受审方。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8e9f0g1-h2i3-4j4k-5l6m-n7o8p9q0r1s2",
    chinese_name: "审计员",
    english_name: "Auditor",
    definition: "有资格并被批准进行审计的个人。\n注：术语“审计员”(Auditor)指IOSA审计员，而术语“审计员”(auditor)是通用的。\n注：对于ISAGO，审计员是CoPA的成员。\n参见：专业审计员宪章(Charter of Professional Auditors (CoPA))。",
    equivalent_terms: "",
    see_also: "Charter of Professional Auditors (CoPA)",
    see_also_array: ["Charter of Professional Auditors (CoPA)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9f0g1h2-i3j4-4k5l-6m7n-o8p9q0r1s2t3",
    chinese_name: "审计员行动",
    english_name: "Auditor Actions",
    definition: "由审计员执行的预定行动步骤，以收集足够证据支持对IOSA/ISSA或ISAGO标准或建议做法的符合性或不符合性的判定。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0g1h2i3-j4k5-4l6m-7n8o-p9q0r1s2t3u4",
    chinese_name: "审计员时效性数据库",
    english_name: "Auditor Currency Database",
    definition: "由IATA维护的数据库，包含每个审计组织(AO)的批准IOSA审计员的资格，以及满足时效性要求的日期。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "01h2i3j4-k5l6-4m7n-8o9p-q0r1s2t3u4v5",
    chinese_name: "审计员独立性",
    english_name: "Auditor Independence",
    definition: "独立于被审计的职能领域或其经理的审计员。如果审计员受到被审计职能领域经理的任何类型的绩效评估活动（无论是否与薪酬挂钩），则审计员的公正性或职能独立性将被视为受到损害。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "12i3j4k5-l6m7-4n8o-9p0q-r1s2t3u4v5w6",
    chinese_name: "审计员个人数据文件",
    english_name: "Auditor Personal Data File",
    definition: "提供IOSA/ISSA审计员个人、背景和资格数据记录的文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "23j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7",
    chinese_name: "审计员先决条件记录 (APR)",
    english_name: "Auditor Prerequisite Record (APR)",
    definition: "由审计组织(AO)准备并由IATA审查批准的行政文件，以确保IOSA/ISSA审计员候选人已满足所有资格先决条件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "34k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8",
    chinese_name: "审计员资格记录 (AQR)",
    english_name: "Auditor Qualifications Record (AQR)",
    definition: "由审计组织(AO)准备并由IATA审查的行政文件，用于批准或跟踪IOSA/ISSA审计员的资格。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "45l6m7n8-o9p0-4q1r-2s3t-u4v5w6x7y8z9",
    chinese_name: "授权人员",
    english_name: "Authorized Person",
    definition: "由运营人、AMO或适用当局授权执行特定飞机维修工作，并在需要时，在批准的条款内为此类工作的执行进行认证的人员。人员也可以由当局通过颁发维修授权书为特定目的授权。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "56m7n8o9-p0q1-4r2s-3t4u-v5w6x7y8z9a0",
    chinese_name: "当局（监管）",
    english_name: "Authority (Regulatory)",
    definition: "在定义的管辖范围内行使监管或监督控制的政府机构或其他行政机构。",
    equivalent_terms: "Regulatory Authority, Regulator",
    see_also: "National Aviation Authority",
    see_also_array: ["National Aviation Authority"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "67n8o9p0-q1r2-4s3t-4u5v-w6x7y8z9a0b1",
    chinese_name: "权力",
    english_name: "Authority",
    definition: "被授予的权力或权利，以：\n• 命令或指挥；\n• 做出具体决定；\n• 授予许可和/或提供批准；\n• 控制或修改一个过程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "78o9p0q1-r2s3-4t4u-5v6w-x7y8z9a0b1c2",
    chinese_name: "自动可部署飞行记录器 (ADFR)",
    english_name: "Automatic Deployable Flight Recorder (ADFR)",
    definition: "安装在飞机上的一种飞行记录器，能够在事故发生时自动部署或与飞机分离。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "89p0q1r2-s3t4-4u5v-6w7x-y8z9a0b1c2d3",
    chinese_name: "自动飞行监控系统",
    english_name: "Automated Flight Monitoring System",
    definition: "一个集成了自动化功能的系统，当某些运行参数被超出时，向运行控制人员（通常是FOO、FOA或指定管理人员）提供进行中航班的运行数据。数据可能根据运营人或国家的要求而有所不同，但可能包括起飞和到达延误、航路和/或高度偏差、通信中断、目的地/备降场最低报告/预报、天气/风向变化、飞机燃油状态、空中交通延误或阻塞点、机场状态或延误信息、导航设施变化、火山灰咨询、风切变警报、恶劣天气咨询和安全警报等项目。运营人可以将此系统扩展到每个航班的特定“任务”参数中，并结合风险评估。为了应对潜在的系统故障，运营人应有一个有效的备用系统，以确保运行安全得到维持。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "90q1r2s3-t4u5-4v6w-7x8y-z9a0b1c2d3e4",
    chinese_name: "自主遇险位置传输系统",
    english_name: "Autonomous Distress Position Transmission System",
    definition: "能够使用信息传输来确定遇险飞机位置的能力，至少每分钟一次，并且对飞机电力、导航和通信系统的故障具有弹性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1r2s3t4-u5v6-4w7x-8y9z-a0b1c2d3e4f5",
    chinese_name: "自主遇险追踪 (ADT)",
    english_name: "Autonomous Distress Tracking (ADT)",
    definition: "用于识别遇险飞机位置的功能，旨在在合理范围内确定事故现场位置，半径为6海里。\n参见：自主遇险位置传输系统(Autonomous Distress Position Transmission System)。",
    equivalent_terms: "",
    see_also: "Autonomous Distress Position Transmission System",
    see_also_array: ["Autonomous Distress Position Transmission System"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2c3d4e5-f6g7-4h8i-9j0k-l1m2n3o4p5q6b2",
    chinese_name: "背景调查",
    english_name: "Background Check",
    definition: "根据国家立法，对个人身份和过往经历进行的核查，包括犯罪历史和任何其他与评估个人是否适合的相关安全信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3d4e5f6-g7h8-4i9j-0k1l-m2n3o4p5q6r7c3",
    chinese_name: "行李",
    english_name: "Baggage",
    definition: "经承运人同意，在飞机上运输的旅客或机组人员的个人财产。",
    equivalent_terms: "Luggage",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4e5f6g7-h8i9-4j0k-1l2m-n3o4p5q6r7s8d4",
    chinese_name: "行李托运点",
    english_name: "Baggage Drop-off",
    definition: "通常位于机场的地点，作为航班前值机流程的一部分，旅客将行李交付或交给航空公司并收到收据（行李牌）。一旦被航空公司接收，托运行李随后会经过安检，并在适用时存放在安全区域，然后装载到飞机上。\n参见：托运行李(Checked Baggage)。",
    equivalent_terms: "Baggage Drop",
    see_also: "Checked Baggage",
    see_also_array: ["Checked Baggage"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5f6g7h8-i9j0-4k1l-2m3n-o4p5q6r7s8t9e5",
    chinese_name: "行李核对",
    english_name: "Baggage Reconciliation",
    definition: "一种安保程序，将旅客与其托运行李进行匹配，并确保旅客和行李作为同行行李在同一架飞机上旅行，或者如果非同行行李经过适当识别、按适当标准安检并被承运人接受运输，则在不同航班上旅行。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6g7h8i9-j0k1-4l2m-3n4o-p5q6r7s8t9u0f6",
    chinese_name: "平衡单",
    english_name: "Balance Sheet",
    definition: "记录飞机重量分布并显示飞机在起飞和降落时重心的表格。它可以是载重单的附件，也可以是单独的文件。\n参见：载重单(Load Sheet)。",
    equivalent_terms: "",
    see_also: "Load Sheet",
    see_also_array: ["Load Sheet"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7h8i9j0-k1l2-4m3n-4o5p-q6r7s8t9u0v1g7",
    chinese_name: "压舱物",
    english_name: "Ballast",
    definition: "为达到特定的飞机平衡条件而在飞机上携带的死重。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8i9j0k1-l2m3-4n4o-5p6q-r7s8t9u0v1w2h8",
    chinese_name: "基地维修",
    english_name: "Base Maintenance",
    definition: "任何不符合航线维修标准的维修任务。\n注：根据“渐进式”维修大纲进行维护的飞机需要就此段落进行单独评估。原则上，允许进行一些“渐进式”检查的决定取决于评估，即特定检查内的所有任务都可以在指定的航线维修站安全地按要求标准完成。\n参见：航线维修(Line Maintenance)。",
    equivalent_terms: "Heavy Maintenance",
    see_also: "Line Maintenance",
    see_also_array: ["Line Maintenance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9j0k1l2-m3n4-4o5p-6q7r-s8t9u0v1w2x3i9",
    chinese_name: "基准月",
    english_name: "Base Month",
    definition: "用于确定飞行机组成员资格间隔的术语；指包含飞行机组成员资格首次确立或在长期缺勤后重新确立的周年日期的月份。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j0k1l2m3-n4o5-4p6q-7r8s-t9u0v1w2x3y4j0",
    chinese_name: "行为",
    english_name: "Behavior",
    definition: "一个人对特定情境的公开或隐蔽的反应方式；能够被测量。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1l2m3n4-o5p6-4q7r-8s9t-u0v1w2x3y4z5k1",
    chinese_name: "行为侦测",
    english_name: "Behavior Detection",
    definition: "在航空安保环境中，应用涉及识别行为特征的技术，包括但不限于指示异常行为的生理或姿态迹象，以识别可能对民航构成威胁的人员。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2m3n4o5-p6q7-4r8s-9t0u-v1w2x3y4z5a6l2",
    chinese_name: "行为指标",
    english_name: "Behavioral Indicator",
    definition: "任何飞行机组成员执行的公开行动或发表的声明，表明机组如何处理事件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3n4o5p6-q7r8-4s9t-0u1v-w2x3y4z5a6b7m3",
    chinese_name: "最佳实践",
    english_name: "Best Practice",
    definition: "通常被认为是能有效帮助运营人实现运营目标的策略、过程、方法、工具或技术。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4o5p6q7-r8s9-4t0u-1v2w-x3y4z5a6b7c8n4",
    chinese_name: "生化检测",
    english_name: "Biochemical Testing",
    definition: "从个人处获取呼吸、血液、尿液或其他体液或组织的样本，并提交进行生化或生物物理实验室检验和分析的过程，其结果被引用作为特定行为的证据。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5p6q7r8-s9t0-4u1v-2w3x-y4z5a6b7c8d9o5",
    chinese_name: "散装货物",
    english_name: "Bulk Cargo",
    definition: "以散装物品或件装形式装入飞机货舱的货物。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6q7r8s9-t0u1-4v2w-3x4y-z5a6b7c8d9e0p6",
    chinese_name: "客舱",
    english_name: "Cabin",
    definition: "参见：旅客客舱(Passenger Cabin)。",
    equivalent_terms: "",
    see_also: "Passenger Cabin",
    see_also_array: ["Passenger Cabin"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7r8s9t0-u1v2-4w3x-4y5z-a6b7c8d9e0f1q7",
    chinese_name: "客舱入口门",
    english_name: "Cabin Access Door",
    definition: "飞机机身上用于进入和离开旅客客舱的门。",
    equivalent_terms: "Cabin Entry Door",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8s9t0u1-v2w3-4x4y-5z6a-b7c8d9e0f1g2r8",
    chinese_name: "手提行李",
    english_name: "Cabin Baggage",
    definition: "由旅客或机组成员保管并意图带入飞机客舱存放的行李。",
    equivalent_terms: "Hand Baggage, Unchecked Baggage, Carry-on Baggage",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9t0u1v2-w3x4-4y5z-6a7b-c8d9e0f1g2h3s9",
    chinese_name: "客舱机组",
    english_name: "Cabin Crew",
    definition: "非飞行机组成员，根据当局要求以及运营人和/或机长指派，在旅客客舱执行安全职责；有资格在紧急情况下执行客舱功能，并实施程序以确保旅客安全有序地撤离。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0u1v2w3-x4y5-4z6a-7b8c-d9e0f1g2h3i4t0",
    chinese_name: "客舱机组成员",
    english_name: "Cabin Crew Member",
    definition: "客舱机组的一员。\n参见：客舱机组(Cabin Crew)。",
    equivalent_terms: "Flight Attendant, Cabin Attendant",
    see_also: "Cabin Crew",
    see_also_array: ["Cabin Crew"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1v2w3x4-y5z6-4a7b-8c9d-e0f1g2h3i4j5u1",
    chinese_name: "客舱机组工作站",
    english_name: "Cabin Crew Station",
    definition: "旅客客舱内靠近或毗邻地板层紧急出口的区域，安装有配备安全带的前向或后向座位（乘务员座椅）。此类工作站通常包括以下部分或全部设施：\n• 带有氧气面罩的服务单元；\n• 内话手机和公共广播(PA)系统；\n• 阅读/工作灯；\n• 安全设备隔间；\n• 乘务员指示面板（在某些机型上）。\n参见：乘务员座椅(Jump Seat)。",
    equivalent_terms: "Emergency Evacuation Station, Cabin Crew Member Station",
    see_also: "Jump Seat",
    see_also_array: ["Jump Seat"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2w3x4y5-z6a7-4b8c-9d0e-f1g2h3i4j5k6v2",
    chinese_name: "日历月",
    english_name: "Calendar Month",
    definition: "用于确定飞行机组成员资格到期日；通常指从一个月初到该月末的期间，此时资格间隔设定为到期。例如，一个12个日历月的资格间隔意味着，如果飞行机组成员的原始资格日期是2016年3月1日，该机组成员的资格将持续到2017年3月31日。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3x4y5z6-a7b8-4c9d-0e1f-g2h3i4j5k6l7w3",
    chinese_name: "日历年",
    english_name: "Calendar Year",
    definition: "公历中从1月1日开始到12月31日结束的时间段（365天，闰年为366天）。例如，2016年1月1日至2016年12月31日为一个日历年。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4y5z6a7-b8c9-4d0e-1f2g-h3i4j5k6l7m8x4",
    chinese_name: "校准",
    english_name: "Calibration",
    definition: "应用特定的已知和精确测量的输入，以确保项目将产生特定的已知输出，该输出被精确测量或指示。校准包括酌情进行调整或记录修正。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5z6a7b8-c9d0-4e1f-2g3h-i4j5k6l7m8n9y5",
    chinese_name: "标准喊话",
    english_name: "Callout",
    definition: "参见：标准喊话(Standard Callout)。",
    equivalent_terms: "",
    see_also: "Standard Callout",
    see_also_array: ["Standard Callout"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6a7b8c9-d0e1-4f2g-3h4i-j5k6l7m8n9o0z6",
    chinese_name: "运力购买协议 (CPA)",
    english_name: "Capacity Purchase Agreement (CPA)",
    definition: "通常在大型运营人和区域性附属运营人之间签订的商业协议，大型运营人购买附属运营人飞机的全部运力，以运输其自身的乘客和/或货物。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7b8c9d0-e1f2-4g3h-4i5j-k6l7m8n9o0p1a7",
    chinese_name: "机长",
    english_name: "Captain",
    definition: "有资格担任飞机机长的人员。\n参见：机长(Pilot-in-command (PIC))。",
    equivalent_terms: "Commander",
    see_also: "Pilot-in-command (PIC)",
    see_also_array: ["Pilot-in-command (PIC)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8c9d0e1-f2g3-4h4i-5j6k-l7m8n9o0p1q2b8",
    chinese_name: "货物",
    english_name: "Cargo",
    definition: "除随行行李或错运行李外的任何有偿或无偿的货物或财产运输，在飞机上运输且在飞行期间不被消耗或使用。\n有偿货物–为商业目的在飞机上运输的货物；为运营人创造收入。\n无偿货物–为非商业目的在飞机上运输的货物；不为运营人创造收入。\n注：公司物资(COMAT)属于无偿货物。\n注：在IOSA/ISAGO标准中，无偿货物和有偿货物在处理、装载、固定和运输方面被同等对待。\n注：在IOSA/ISAGO标准中，“邮件”被视为“货物”的一项：因此，任何提及货物的地方也包括邮件。\n参见：公司物资(COMAT (Company Material)), 已知货物(Known Cargo), 未知货物(Unknown Cargo)。",
    equivalent_terms: "Freight",
    see_also: "COMAT (Company Material), Known Cargo, Unknown Cargo",
    see_also_array: ["COMAT (Company Material)", "Known Cargo", "Unknown Cargo"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9d0e1f2-g3h4-4i5j-6k7l-m8n9o0p1q2r3c9",
    chinese_name: "货机",
    english_name: "Cargo Aircraft",
    definition: "除客机外，运输货物的飞机。\n参见：货物(Cargo), 客机(Passenger Aircraft)。",
    equivalent_terms: "",
    see_also: "Cargo, Passenger Aircraft",
    see_also_array: ["Cargo", "Passenger Aircraft"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0e1f2g3-h4i5-4j6k-7l8m-n9o0p1q2r3s4d0",
    chinese_name: "货物随行人员",
    english_name: "Cargo Attendant",
    definition: "在货机上为陪同货物运输而搭载的额外人员。\n参见：货物(Cargo), 货机(Cargo Aircraft), 额外人员(Supernumerary)。",
    equivalent_terms: "",
    see_also: "Cargo, Cargo Aircraft, Supernumerary",
    see_also_array: ["Cargo", "Cargo Aircraft", "Supernumerary"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1f2g3h4-i5j6-4k7l-8m9n-o0p1q2r3s4t5e1",
    chinese_name: "货舱",
    english_name: "Cargo Compartment",
    definition: "飞机上可用于运输货物和/或行李的区域。货舱有不同的分类，根据飞机类型和/或配置，一些货舱机组人员在飞行中可以进入，而另一些则不能。\nA级货舱–可用于装载行李或货物；飞行中易于进入；机组成员在其工作站即可轻易发现火情。\nB级货舱–可用于装载行李或货物；飞行中有足够通道，使机组成员能够用手提灭火器的内容物有效到达货舱的任何部分；当使用通道时，没有危险数量的烟、火焰或灭火剂会进入机组或乘客占用的任何隔间；有独立的经批准的烟雾探测器或火灾探测器系统，可提供驾驶舱警报。\nC级货舱–可用于装载行李或货物；不满足A级或B级货舱的进入要求；有独立的经批准的烟雾探测器或火灾探测器系统，可提供驾驶舱警报；有经批准的内置灭火或抑火系统，可从驾驶舱控制；有控制货舱内通风和气流的装置，以便使用的灭火剂能够控制货舱内可能发生的任何火灾。\nD级货舱–指货物或行李舱，其中：(i) 发生的火灾将完全被限制住，不会危及飞机或乘客的安全；(ii) 有办法排除任何危险数量的烟、火焰或其他有毒气体进入机组或乘客占用的任何隔间；(iii) 每个隔间内的通风和气流得到控制，以便隔间内可能发生的任何火灾不会超出安全限度；(iv) 考虑到隔间内的热量对飞机相邻关键部件的影响；以及(v) 隔间容积不超过28.32立方米。\nE级货舱–仅用于运输货物；有独立的经批准的烟雾探测器或火灾探测器系统，可提供驾驶舱警报；有机组人员关闭通往或在货舱内的通风气流的装置；有办法排除任何危险数量的烟、火焰或有毒气体进入驾驶舱；允许在任何货物装载条件下进入所需的机组紧急出口。\nF级货舱–必须位于主甲板上，并且是其中之一：有独立的经批准的烟雾探测器或火灾探测器系统，在机组成员工作站发出警报；有不需机组成员进入隔间即可灭火或控制火灾的装置；有办法排除任何危险数量的烟、火焰或灭火剂进入机组或乘客占用的任何隔间。",
    equivalent_terms: "Cargo Hold, Cargo Area, Baggage Hold, Baggage Compartment",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2g3h4i5-j6k7-4l8m-9n0o-p1q2r3s4t5u6f2",
    chinese_name: "货舱灭火系统",
    english_name: "Cargo Compartment Fire Suppression System",
    definition: "一种便携式或内置的灭火方法，不会对飞机内的空气造成危险污染，并提供一种方法来控制或探测和扑灭可能发生的火灾，且不会对飞机造成额外危险。此类系统不能影响飞行机组维持受控飞行的能力，并且还可能考虑到由爆炸或燃烧装置或危险品引起的突然而广泛的火灾。在货舱可由飞行机组或从客舱（客货混合机）进入的飞机中，一名有机组人员使用经运营人所在国批准或接受的灭火器，可以满足灭火的要求。当与固定的火灾探测系统和在适用区域经运营人所在国批准或接受的防火材料结合使用时，此类机组成员的行动符合灭火系统的定义。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3h4i5j6-k7l8-4m9n-0o1p-q2r3s4t5u6v7g3",
    chinese_name: "货运设施",
    english_name: "Cargo Facility",
    definition: "进行货物接收和/或货物处理操作的任何设施。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4i5j6k7-l8m9-4n0o-1p2q-r3s4t5u6v7w8h4",
    chinese_name: "货运航班",
    english_name: "Cargo Flight",
    definition: "运输货物的航班。\n参见：货物(Cargo)。",
    equivalent_terms: "",
    see_also: "Cargo",
    see_also_array: ["Cargo"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5j6k7l8-m9n0-4o1p-2q3r-s4t5u6v7w8x9i5",
    chinese_name: "货物（高风险）",
    english_name: "Cargo (High-risk)",
    definition: "参见：高风险货物(High-risk Cargo)。",
    equivalent_terms: "",
    see_also: "High-risk Cargo",
    see_also_array: ["High-risk Cargo"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6k7l8m9-n0o1-4p2q-3r4s-t5u6v7w8x9y0j6",
    chinese_name: "货物运行手册",
    english_name: "Cargo Operations Manual",
    definition: "参见：运行手册(Operations Manual (OM))。",
    equivalent_terms: "",
    see_also: "Operations Manual (OM)",
    see_also_array: ["Operations Manual (OM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7l8m9n0-o1p2-4q3r-4s5t-u6v7w8x9y0z1k7",
    chinese_name: "货物约束系统",
    english_name: "Cargo Restraint System",
    definition: "飞机上设计的系统，用于在正常和紧急的飞机地面和飞行机动中防止货物在飞机内移动；包括网、座椅滑轨、货盘锁、侧向约束装置和滚轮托盘；当货物与驾驶舱和/或乘客或额外人员在同一甲板上运输时，还可能包括一个9G货网或9G刚性隔板/舱壁（即一个为承受九倍重力载荷而设计的网或隔板）。",
    equivalent_terms: "9G system",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8m9n0o1-p2q3-4r4s-5t6u-v7w8x9y0z1a2l8",
    chinese_name: "适航证书 (CoA)",
    english_name: "Certificate of Airworthiness (CoA)",
    definition: "适用于特定飞机并由国家航空当局(NAA)（或其授权代表）根据飞机符合相应适航要求的满意证据而颁发的证书，该证书允许该飞机开始或继续飞行运行。\n在IOSA中，当提及“初始申请认证日期”时，指的是OEM首次向适用当局提交新机型认证申请的日期。等效的ICAO SARP措辞是：“……对于在某日期或之后提交认证申请的飞机……”\n在IOSA中，当提及“其初始适航证书颁发日期”时，指的是每架飞机的认证日期。等效的ICAO SARP措辞是：“……对于其单机适航证书首次在某日期之后颁发的飞机……”\n参见：出口适航证书(Export Certificate of Airworthiness)。",
    equivalent_terms: "Airworthiness Certificate",
    see_also: "Export Certificate of Airworthiness",
    see_also_array: ["Export Certificate of Airworthiness"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9n0o1p2-q3r4-4s5t-6u7v-w8x9y0z1a2b3m9",
    chinese_name: "批准证书 (COA)",
    english_name: "Certificate of Approval (COA)",
    definition: "由适用的国家航空当局(NAA)（或其授权代表）向运营人或AMO颁发的证书，允许该运营人或AMO进行飞机、飞机发动机或飞机部件的维修。\n参见：批准的维修组织(Approved Maintenance Organization (AMO))。",
    equivalent_terms: "",
    see_also: "Approved Maintenance Organization (AMO)",
    see_also_array: ["Approved Maintenance Organization (AMO)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0o1p2q3-r4s5-4t6u-7v8w-x9y0z1a2b3c4n0",
    chinese_name: "放行证书 (CRS)",
    english_name: "Certificated Release to Service (CRS)",
    definition: "参见：适航放行(Airworthiness Release)。",
    equivalent_terms: "Release to Service",
    see_also: "Airworthiness Release",
    see_also_array: ["Airworthiness Release"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1p2q3r4-s5t6-4u7v-8w9x-y0z1a2b3c4d5o1",
    chinese_name: "认证",
    english_name: "Certification",
    definition: "在维修管理手册(MMM)的签署责任部分中指定负责认证活动的人员的正式签名。该签名必须附有日期、人员的印章、员工编号、执照批准或授权（如适用），并且可以识别出飞机注册号或部件序列号（如适用）。在MMM中指定的文件上进行的认证构成了根据当局法规进行的认证。认证也可以是制造商在成功证明型号设计符合适航要求后颁发飞机型号合格证的行为。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2q3r4s5-t6u7-4v8w-9x0y-z1a2b3c4d5e6p2",
    chinese_name: "认证人员",
    english_name: "Certifying Staff",
    definition: "由运营人或AMO授权，通过签字证明飞机维修已按照各种要求完成的人员。\n参见：认证签署人(Certifying Signatory)。",
    equivalent_terms: "Certifying Signatory",
    see_also: "Certifying Signatory",
    see_also_array: ["Certifying Signatory"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3r4s5t6-u7v8-4w9x-0y1z-a2b3c4d5e6f7q3",
    chinese_name: "认证签署人",
    english_name: "Certifying Signatory",
    definition: "根据任务卡字段中标识为“有执照的飞机维修工程师(LAME)”、“签署人”、“认证”、“批准签署人”、“质量检验员”或“检查员”等“签署责任”被认证进行飞机维修的人员。所有认证均由签署人完成，签署人可以是：\n• 一名适当持有执照的飞机维修工程师(LAME)，负责对飞机进行的维修，或\n• 一名适当授权的检查员，负责在任何车间完成的任务卡。术语“签署人”还包括持有维修或过站授权、无损检测(NDT)授权、焊接授权或批准签署人，他们在适用文件上对自己完成的工作进行认证。",
    equivalent_terms: "Certifying Staff, Certifying Person",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4s5t6u7-v8w9-4x0y-1z2a-b3c4d5e6f7g8r4",
    chinese_name: "变更管理",
    english_name: "Change Management",
    definition: "一种系统化的方法，用于识别和分析可能影响组织功能的内部和外部变化，并评估和控制与这些变化相关的风险。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5t6u7v8-w9x0-4y1z-2a3b-c4d5e6f7g8h9s5",
    chinese_name: "专业审计员宪章 (CoPA)",
    english_name: "Charter of Professional Auditors (CoPA)",
    definition: "由IATA管理的一项会员计划，面向所有ISAGO审计员，他们已证明在ISAGO的审计和运营专业知识方面达到了标准化的能力水平。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6u7v8w9-x0y1-4z2a-3b4c-d5e6f7g8h9i0t6",
    chinese_name: "包机客运航班",
    english_name: "Charter Passenger Flight",
    definition: "一种客运航班，其行程通常不包含在运营人公布的航班时刻表和/或航线系统中；此类航班需要相关当局的批准。开放式包机客运航班——一种包机客运航班，其座位通常由运营人或通过旅行社向公众出售。封闭式包机客运航班——一种包机客运航班，由政府、个人或个别组织安排、签约并支付整架飞机的运营费用，以运输特定群体的乘客（例如军人、公司员工、运动队成员）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7v8w9x0-y1z2-4a3b-4c5d-e6f7g8h9i0j1u7",
    chinese_name: "检查",
    english_name: "Check",
    definition: "为确定项目的功能能力或物理完整性而进行的检查。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8w9x0y1-z2a3-4b4c-5d6e-f7g8h9i0j1k2v8",
    chinese_name: "托运行李",
    english_name: "Checked Baggage",
    definition: "已由运营人保管并已向乘客出具行李领取凭证的乘客行李；包括已从乘客处取走并装入货舱的随身行李（例如由于尺寸/重量限制、客舱储物空间不足）。\n参见：货舱行李(Hold Baggage)。",
    equivalent_terms: "Registered Baggage, Registered Luggage",
    see_also: "Hold Baggage",
    see_also_array: ["Hold Baggage"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9x0y1z2-a3b4-4c5d-6e7f-g8h9i0j1k2l3w9",
    chinese_name: "化学氧气发生器",
    english_name: "Chemical Oxygen Generator",
    definition: "一种含有化学物质的装置，激活后会产生并释放氧气，供乘客和/或机组人员在紧急情况下使用。",
    equivalent_terms: "Oxygen Generator, O2 Generator",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0y1z2a3-b4c5-4d6e-7f8g-h9i0j1k2l3m4x0",
    chinese_name: "慢性故障件",
    english_name: "Chronic Items",
    definition: "持续失效或引起问题的飞机部件。",
    equivalent_terms: "Rogue Components",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1z2a3b4-c5d6-4e7f-8g9h-i0j1k2l3m4n5y1",
    chinese_name: "清洁飞机概念",
    english_name: "Clean Aircraft Concept",
    definition: "确保在机翼、螺旋桨、操纵面、发动机进气口或其他关键表面存在或附着冰、雪、雪泥或霜时不起飞的保证。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2a3b4c5-d6e7-4f8g-9h0i-j1k2l3m4n5o6z2",
    chinese_name: "盘旋进近",
    english_name: "Circling Approach",
    definition: "直线仪表进近程序的延伸，为在另一条跑道上着陆提供目视机动，该跑道的最后进近航迹对准或下降梯度超出了直线进近的设计标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3b4c5d6-e7f8-4g9h-0i1j-k2l3m4n5o6p7a3",
    chinese_name: "濒危野生动植物种国际贸易公约 (CITES)",
    english_name: "CITES (The Convention on International Trade in Endangered Species of Wild Fauna and Flora)",
    definition: "各国政府间的一项国际协议，旨在确保野生动植物标本的国际贸易不会威胁其生存。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4c5d6e7-f8g9-4h0i-1j2k-l3m4n5o6p7q8b4",
    chinese_name: "净空区",
    english_name: "Clear Zone",
    definition: "旅客客舱内紧邻驾驶舱入口门前方的区域，包括厨房和盥洗室。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5d6e7f8-g9h0-4i1j-2k3l-m4n5o6p7q8r9c5",
    chinese_name: "结束会议",
    english_name: "Closing Meeting",
    definition: "在审计现场评估阶段结束时举行的正式会议，允许审计组与运营人或提供商讨论与发现项和观察项、纠正行动计划(CAP)以及与审计过程相关的其他主题有关的信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6e7f8g9-h0i1-4j2k-3l4m-n5o6p7q8r9s0d6",
    chinese_name: "驾驶舱",
    english_name: "Cockpit",
    definition: "参见：驾驶舱(Flight Deck)。",
    equivalent_terms: "",
    see_also: "Flight Deck",
    see_also_array: ["Flight Deck"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7f8g9h0-i1j2-4k3l-4m5n-o6p7q8r9s0t1e7",
    chinese_name: "驾驶舱话音记录器 (CVR)",
    english_name: "Cockpit Voice Recorder (CVR)",
    definition: "一种记录驾驶舱内音频信息的飞行记录器。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8g9h0i1-j2k3-4l4m-5n6o-p7q8r9s0t1u2f8",
    chinese_name: "代码共享协议",
    english_name: "Code Share Agreement",
    definition: "两个或多个运营人合作在仅由其中一个运营人运营的航班上运输乘客和/或货物的商业协议。运输乘客和/或货物的运营人被称为运营（或管理）承运人，并对此类航班行使运营控制权；其他运营人被称为营销运营人。每个运营人都以其各自的指定代码（即代码）和航班号销售该航班（即出售座位和/或货运空间）。",
    equivalent_terms: "Code-share, Codeshare",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9h0i1j2-k3l4-4m5n-6o7p-q8r9s0t1u2v3g9",
    chinese_name: "公司物资 (COMAT)",
    english_name: "COMAT (Company Material)",
    definition: "运营人为自身目的在其飞机上运输的物料。\n参见：货物(Cargo)。",
    equivalent_terms: "Company Supplies",
    see_also: "Cargo",
    see_also_array: ["Cargo"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0i1j2k3-l4m5-4n6o-7p8q-r9s0t1u2v3w4h0",
    chinese_name: "客货混合机",
    english_name: "Combi (Combined Passenger and Cargo) Aircraft",
    definition: "一种可以在主层甲板上以不同比例同时装载货物和乘客，并可互换配置的飞机。客货混合机通常具有超大货舱门、加固地板、客舱地板上的轨道以便快速增减座位，以及客舱内的隔板以实现客货混合。\n注：当用于运输乘客时，客货混合机被定义为客机。\n注：带有主甲板行李舱的客机不在此定义范围内。\n参见：货物(Cargo), 货机(Cargo Aircraft), 货物约束系统(Cargo Restraint System), 旅客(Passenger), 客机(Passenger Aircraft), 烟雾隔板(Smoke Barrier)。",
    equivalent_terms: "",
    see_also: "Cargo, Cargo Aircraft, Cargo Restraint System, Passenger, Passenger Aircraft, Smoke Barrier",
    see_also_array: ["Cargo", "Cargo Aircraft", "Cargo Restraint System", "Passenger", "Passenger Aircraft", "Smoke Barrier"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1j2k3l4-m5n6-4o7p-8q9r-s0t1u2v3w4x5i1",
    chinese_name: "联合审计",
    english_name: "Combined Audit",
    definition: "一种评估地面服务提供商（GSP）在全球仅一个站点提供ISAGO范围内地面运营的企业管理政策、流程和程序的适用GOSARP符合性的审计。该GSP必须其唯一的总部设在站点附近，从而使总部和站点审计可以视为同一审计。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2k3l4m5-n6o7-4p8q-9r0s-t1u2v3w4x5y6j2",
    chinese_name: "组合视觉系统 (CVS)",
    english_name: "Combined Vision System (CVS)",
    definition: "一种结合了增强视觉系统(EVS)和合成视觉系统(SVS)的图像显示系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3l4m5n6-o7p8-4q9r-0s1t-u2v3w4x5y6z7k3",
    chinese_name: "机长培训",
    english_name: "Command Training",
    definition: "旨在为飞行机组成员准备担任机长(PIC)职位的培训；涉及与特定运营人运营相关的指挥飞机的技术和非技术方面。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4m5n6o7-p8q9-4r0s-1t2u-v3w4x5y6z7a8l4",
    chinese_name: "商业运行",
    english_name: "Commercial Operations",
    definition: "为获取报酬或租赁而进行的乘客和/或货物运输飞行。\n注：非商业运行包括为报酬或租赁以外目的进行的飞行（例如，调机、训练飞行、测试飞行）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5n6o7p8-q9r0-4s1t-2u3v-w4x5y6z7a8b9m5",
    chinese_name: "公司邮件 (COM)",
    english_name: "Company Mail (COM)",
    definition: "航空公司内部在机场之间空运的办公室间信件，未列入清单且无需支付邮资。",
    equivalent_terms: "COMAIL",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6o7p8q9-r0s1-4t2u-3v4w-x5y6z7a8b9c0n6",
    chinese_name: "能力",
    english_name: "Competency",
    definition: "为按规定标准完成一项任务所需的技能、知识和态度的组合。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7p8q9r0-s1t2-4u3v-4w5x-y6z7a8b9c0d1o7",
    chinese_name: "基于能力的培训",
    english_name: "Competency-based Training",
    definition: "以绩效为导向，强调绩效标准及其衡量，并为达到指定绩效标准而发展培训的培训和评估。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8q9r0s1-t2u3-4v4w-5x6y-z7a8b9c0d1e2p8",
    chinese_name: "主管当局",
    english_name: "Competent Authority",
    definition: "一国境内具有合法授权、能力或权力以执行指定职能的实体。\n注：在IOSA标准手册(ISM)、ISSA标准手册(ISSM)和ISAGO标准手册(GOSM)中使用的“主管当局”一词是指一国境内被指定负责民航相关人员和组织认证与监督，并拥有必要权力和责任的当局。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9r0s1t2-u3v4-4w5x-6y7z-a8b9c0d1e2f3q9",
    chinese_name: "符合性",
    english_name: "Compliance",
    definition: "符合标准或法规中规定的规则或要求的状态。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0s1t2u3-v4w5-4x6y-7z8a-b9c0d1e2f3g4r0",
    chinese_name: "基于符合性的监管监督",
    english_name: "Compliance-Based Regulatory Oversight",
    definition: "国家民航当局为确保安全而使用的传统和规定性方法；要求运营人严格遵守预先设立的非可变法规。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1t2u3v4-w5x6-4y7z-8a9b-c0d1e2f3g4h5s1",
    chinese_name: "合规义务",
    english_name: "Compliance Obligation",
    definition: "强制性合规义务或自愿性合规义务。强制性合规义务包括法律法规，而自愿性合规义务包括合同承诺、社区和行业标准、道德行为准则和良好治理准则。一旦运营人决定遵守自愿性义务，该义务即成为强制性合规义务。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2u3v4w5-x6y7-4z8a-9b0c-d1e2f3g4h5i6t2",
    chinese_name: "部件维修手册 (CMM)",
    english_name: "Component Maintenance Manual (CMM)",
    definition: "由特定部件制造商制作并持续更新，用于该部件维修的手册。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3v4w5x6-y7z8-4a9b-0c1d-e2f3g4h5i6j7u3",
    chinese_name: "有条件条款",
    english_name: "Conditional Provision",
    definition: "仅当运营人或提供商满足特定操作条件时才适用的IOSA/ISSA/ISAGO标准或建议做法，该条件在条款中以“如果运营人……”或“如果提供商……”开头的短语（条件短语）形式说明。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4w5x6y7-z8a9-4b0c-1d2e-f3g4h5i6j7k8v4",
    chinese_name: "构型偏差清单 (CDL)",
    english_name: "Configuration Deviation List (CDL)",
    definition: "由负责飞机型号设计的组织制定，并经设计国批准的清单，列出了在航班开始时可能缺失的飞机型号的任何外部部件，并在必要时包含相关的操作限制和性能修正信息。",
    equivalent_terms: "MEL/CDL, DDM, DDG, List of Acceptable Malfunctions (Russian built aircraft)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5x6y7z8-a9b0-4c1d-2e3f-g4h5i6j7k8l9w5",
    chinese_name: "冲突区",
    english_name: "Conflict Zone",
    definition: "武装冲突正在发生或可能在军事化各方之间发生的地区上空的空域；也包括这些各方处于高度军事戒备或紧张状态的地区上空的空域，这可能危及民用航空。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6y7z8a9-b0c1-4d2e-3f4g-h5i6j7k8l9m0x6",
    chinese_name: "符合性报告",
    english_name: "Conformance Report",
    definition: "为分享运营人根据其质量保证计划，按照适用的IOSA标准对ISARPs进行的内部审计结果而编制的正式准确记录。该报告提供的信息反映了：\n• 与对所有ISARPs进行的审计相关的具体细节。\n• 与所有ISARPs的符合状态。\n参见：ISARPs(ISARPs)。\n注：符合性报告可以使用IATA的模板或运营人的内部数据库、受控程序文件或其任意组合创建。",
    equivalent_terms: "",
    see_also: "ISARPs",
    see_also_array: ["ISARPs"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7z8a9b0-c1d2-4e3f-4g5h-i6j7k8l9m0n1y7",
    chinese_name: "符合性",
    english_name: "Conformity",
    definition: "满足标准或建议做法中包含的规范；在IOSA/ISSA/ISAGO下，符合性意味着规范已由运营人/提供商记录和/或实施。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8a9b0c1-d2e3-4f4g-5h6i-j7k8l9m0n1o2z8",
    chinese_name: "符合性 (IEnvA)",
    english_name: "Conformity (IEnvA)",
    definition: "满足一项要求，例如IEnvA标准、合规义务或运营人为自身设立的任何额外环境要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9b0c1d2-e3f4-4g5h-6i7j-k8l9m0n1o2p3a9",
    chinese_name: "托运货物",
    english_name: "Consignment",
    definition: "参见：货物(Shipment)。",
    equivalent_terms: "",
    see_also: "Shipment",
    see_also_array: ["Shipment"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0c1d2e3-f4g5-4h6i-7j8k-l9m0n1o2p3q4b0",
    chinese_name: "咨询服务",
    english_name: "Consulting Services",
    definition: "通过提供专业或专家建议和/或交付服务或产品，向运营人或地面服务提供商提供的援助、咨询、指导或培训，包括但不限于培训交付、运营支持、文件开发和/或质量保证服务。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1d2e3f4-g5h6-4i7j-8k9l-m0n1o2p3q4r5c1",
    chinese_name: "污染跑道",
    english_name: "Contaminated Runway",
    definition: "当所需使用长度和宽度内超过25%的跑道表面区域（无论是在孤立区域还是非孤立区域）被以下物质覆盖时的跑道状态：\n• 深度超过3毫米（0.125英寸）的水或雪泥，或\n• 深度超过20毫米（0.75英寸）的松雪，或\n• 压实的雪或冰，包括湿冰。\n参见：干跑道(Dry Runway), 湿跑道(Wet Runway)。",
    equivalent_terms: "",
    see_also: "Dry Runway, Wet Runway",
    see_also_array: ["Dry Runway", "Wet Runway"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2e3f4g5-h6i7-4j8k-9l0m-n1o2p3q4r5s6d2",
    chinese_name: "应急情况",
    english_name: "Contingency",
    definition: "可能发生但不确定的事件。",
    equivalent_terms: "Eventuality",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3f4g5h6-i7j8-4k9l-0m1n-o2p3q4r5s6t7e3",
    chinese_name: "持续改进 (IEnvA)",
    english_name: "Continual Improvement (IEnvA)",
    definition: "持续改进是运营人用于提升其环境绩效的一系列重复性活动。当活动、程序、产品、服务和系统的环境方面得到控制，并且不利的环境影响减少、有益的环境影响产生时，环境绩效就会得到提升。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4g5h6i7-j8k9-4l0m-1n2o-p3q4r5s6t7u8f4",
    chinese_name: "持续适航",
    english_name: "Continuing Airworthiness",
    definition: "飞机、发动机、螺旋桨或部件通过一系列过程，遵守适用的适航要求，并在其整个使用寿命期间保持安全运行状态。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5h6i7j8-k9l0-4m1n-2o3p-q4r5s6t7u8v9g5",
    chinese_name: "持续适航信息",
    english_name: "Continuing Airworthiness Information",
    definition: "为持续保持飞机处于适航状态所需的信息。此类信息包括但不限于：\n• 适航指令(AD)；\n• 制造商维修手册；\n• 修理手册；\n• 补充结构检查文件，服务通告(SB)；\n• 服务说明；\n• 服务信息函(SIL)；\n• 改装通告；\n• 飞机维修大纲；\n• 无损检测(NDT)手册；\n• 其他。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6i7j8k9-l0m1-4n2o-3p4q-r5s6t7u8v9w0h6",
    chinese_name: "持续适航管理说明 (CAME)",
    english_name: "Continuing Airworthiness Management Exposition (CAME)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM))。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM)",
    see_also_array: ["Maintenance Management Manual (MMM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7j8k9l0-m1n2-4o3p-4q5r-s6t7u8v9w0x1i7",
    chinese_name: "持续资格",
    english_name: "Continuing Qualification",
    definition: "一个提供关于必要主题、技能、功能和/或活动的培训和评估的计划，以确保运营和维修人员保持知识并维持初始资格所需的技能熟练度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8k9l0m1-n2o3-4p4q-5r6s-t7u8v9w0x1y2j8",
    chinese_name: "持续结构完整性计划",
    english_name: "Continuing Structural Integrity Program",
    definition: "一个通过持续检查和评估来确保运营人飞机结构坚固性和完整性的计划或时间表。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9l0m1n2-o3p4-4q5r-6s7t-u8v9w0x1y2z3k9",
    chinese_name: "连续下降最后进近 (CDFA)",
    english_name: "Continuous Descent Final Approach (CDFA)",
    definition: "一种与稳定进近程序一致的技术，用于以连续下降方式飞行非精密进近(NPA)程序的最后进近段(FAS)，无需平飞，从最后进近定位点(FAF)高度/高程或以上的高度/高程下降至着陆跑道入口上方约15米（50英尺）的点或所飞机型开始拉平机动的点；对于NPA程序后接盘旋进近的FAS，CDFA技术适用至盘旋进近最低标准（盘旋OCA/H）或目视飞行机动高度/高程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0m1n2o3-p4q5-4r6s-7t8u-v9w0x1y2z3a4l0",
    chinese_name: "持续监视",
    english_name: "Continuous Surveillance",
    definition: "参见：监视(Surveillance)。",
    equivalent_terms: "Surveillance, Audit",
    see_also: "Surveillance",
    see_also_array: ["Surveillance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1n2o3p4-q5r6-4s7t-8u9v-w0x1y2z3a4b5m1",
    chinese_name: "合同外包",
    english_name: "Contracting",
    definition: "参见：外包(Outsourcing)。",
    equivalent_terms: "",
    see_also: "Outsourcing",
    see_also_array: ["Outsourcing"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2o3p4q5-r6s7-4t8u-9v0w-x1y2z3a4b5c6n2",
    chinese_name: "缔约国",
    english_name: "Contracting State",
    definition: "作为《国际民用航空公约》（芝加哥公约）缔约方的国家。",
    equivalent_terms: "Member State",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3p4q5r6-s7t8-4u9v-0w1x-y2z3a4b5c6d7o3",
    chinese_name: "换算的能见度 (CMV)",
    english_name: "Converted Meteorological Visibility (CMV)",
    definition: "根据当局指定的方法，从报告的气象能见度换算得出的能见度值（相当于RVR）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4q5r6s7-t8u9-4v0w-1x2y-z3a4b5c6d7e8p4",
    chinese_name: "受控文件",
    english_name: "Controlled Document",
    definition: "受制于提供内容、修订、发布、分发、可用性和保留的积极控制过程的文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5r6s7t8-u9v0-4w1x-2y3z-a4b5c6d7e8f9q5",
    chinese_name: "可控飞行撞地 (CFIT)",
    english_name: "Controlled Flight into Terrain (CFIT)",
    definition: "一种事故类型，其中一架适航的飞机，在飞行员的控制下，无意中飞入地面、山脉、水体或障碍物。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6s7t8u9-v0w1-4x2y-3z4a-b5c6d7e8f9g0r6",
    chinese_name: "副驾驶",
    english_name: "Co-pilot",
    definition: "参见：副驾驶(Second-in-command)。",
    equivalent_terms: "",
    see_also: "Second-in-command",
    see_also_array: ["Second-in-command"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7t8u9v0-w1x2-4y3z-4a5b-c6d7e8f9g0h1s7",
    chinese_name: "公司审计",
    english_name: "Corporate Audit",
    definition: "参见：总部审计(Headquarters Audit)。",
    equivalent_terms: "",
    see_also: "Headquarters Audit",
    see_also_array: ["Headquarters Audit"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8u9v0w1-x2y3-4z4a-5b6c-d7e8f9g0h1i2t8",
    chinese_name: "纠正措施",
    english_name: "Corrective Action",
    definition: "为消除已发现的不符合或已发现的不良状况或情况的原因并防止其再次发生而采取的行动。\n参见：预防措施(Preventive Action)。",
    equivalent_terms: "Permanent Fix",
    see_also: "Preventive Action",
    see_also_array: ["Preventive Action"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9v0w1x2-y3z4-4a5b-6c7d-e8f9g0h1i2j3u9",
    chinese_name: "纠正行动计划 (CAP)",
    english_name: "Corrective Action Plan (CAP)",
    definition: "运营人或提供商为通过实施全面和永久的纠正措施来关闭一个发现项或观察项的计划。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0w1x2y3-z4a5-4b6c-7d8e-f9g0h1i2j3k4v0",
    chinese_name: "纠正措施报告/记录 (CAR)",
    english_name: "Corrective Action Report/Record (CAR)",
    definition: "一份描述每次审计产生的每个发现项和观察项，并提供有关发现项或观察项以及为关闭该发现项或观察项而采取的相关步骤的历史记录的文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1x2y3z4-a5b6-4c7d-8e9f-g0h1i2j3k4l5w1",
    chinese_name: "注册国",
    english_name: "Country of Registry",
    definition: "参见：注册国(State of Registry)。",
    equivalent_terms: "",
    see_also: "State of Registry",
    see_also_array: ["State of Registry"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2y3z4a5-b6c7-4d8e-9f0g-h1i2j3k4l5m6x2",
    chinese_name: "快递行李",
    english_name: "Courier Baggage",
    definition: "由一个或多个托运人托运的货物，作为快递乘客的行李，在正常乘客托运行李文件下在飞机上运输。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3z4a5b6-c7d8-4e9f-0g1h-i2j3k4l5m6n7y3",
    chinese_name: "机组成员",
    english_name: "Crew Member",
    definition: "飞行机组或客舱机组的成员；当用复数形式（即机组成员）时，指飞行和客舱机组成员的集体。\n参见：飞行机组成员(Flight Crew Member), 客舱机组成员(Cabin Crew Member)。",
    equivalent_terms: "",
    see_also: "Flight Crew Member, Cabin Crew Member",
    see_also_array: ["Flight Crew Member", "Cabin Crew Member"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4a5b6c7-d8e9-4f0g-1h2i-j3k4l5m6n7o8z4",
    chinese_name: "机组资源管理 (CRM)",
    english_name: "Crew Resource Management (CRM)",
    definition: "有效利用飞行机组可用的所有资源，包括彼此，以实现安全高效的飞行。\n参见：人为因素原则(Human Factors Principles), 人的表现(Human Performance)。",
    equivalent_terms: "",
    see_also: "Human Factors Principles, Human Performance",
    see_also_array: ["Human Factors Principles", "Human Performance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5b6c7d8-e9f0-4g1h-2i3j-k4l5m6n7o8p9a5",
    chinese_name: "危机",
    english_name: "Crisis",
    definition: "已达到关键阶段并呈现出明显可能产生不良后果的不稳定或关键情况。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6c7d8e9-f0g1-4h2i-3j4k-l5m6n7o8p9q0b6",
    chinese_name: "飞行的关键阶段",
    english_name: "Critical Phases of Flight",
    definition: "飞行的阶段，通常不包括巡航飞行，但包括所有涉及滑行、起飞和降落的地面操作，以及在特定高度（通常为10,000英尺）以下或在运营人或国家定义的特定飞行条件下进行的所有其他飞行操作。在这些飞行阶段，飞行机组被限制执行：\n• 除了安全操作飞机所需的职责之外的职责；\n• 任何可能分散任何飞行机组成员履行其职责的活动，或可能以任何方式干扰这些职责的正常执行的活动。\n参见：无菌驾驶舱(Sterile Flight Deck)。",
    equivalent_terms: "",
    see_also: "Sterile Flight Deck",
    see_also_array: ["Sterile Flight Deck"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7d8e9f0-g1h2-4i3j-4k5l-m6n7o8p9q0r1c7",
    chinese_name: "CRM协调员",
    english_name: "CRM Facilitator",
    definition: "经过专门培训的教员，有能力提供初始和复训CRM培训课程；具有观察人类行为和态度的能力，并能处理技术问题；具备良好的表达能力，并熟悉运营环境中遇到的问题。\n参见：机组资源管理(Crew Resource Management (CRM))。",
    equivalent_terms: "CRM Instructor, CRM Trainer",
    see_also: "Crew Resource Management (CRM)",
    see_also_array: ["Crew Resource Management (CRM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8e9f0g1-h2i3-4j4k-5l6m-n7o8p9q0r1s2d8",
    chinese_name: "巡航替换飞行员 (CRP)",
    english_name: "Cruise Relief Pilot (CRP)",
    definition: "拥有仅限于在飞行巡航阶段担任飞行员特权的型号等级的飞行机组成员，或任何被指派在巡航飞行期间执行飞行员任务以允许机长或副驾驶获得计划休息的飞行机组成员。",
    equivalent_terms: "Cruise Relief Officer (CRO), Relief Pilot, Relief Flight Officer (RFO)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9f0g1h2-i3j4-4k5l-6m7n-o8p9q0r1s2t3e9",
    chinese_name: "客户航空公司",
    english_name: "Customer Airline",
    definition: "已与外部服务提供商签订合同协议，由其为该航空公司执行特定的运营职能的航空运营人。",
    equivalent_terms: "Client Airline.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0g1h2i3-j4k5-4l6m-7n8o-p9q0r1s2t3u4f0",
    chinese_name: "网络安全",
    english_name: "Cybersecurity",
    definition: "旨在确保系统、网络、程序、设备、信息和数据的机密性、完整性、可用性和全面保护，免受攻击、损坏、未经授权的访问、使用和/或利用的技术、控制和措施，以及流程和实践的集合。",
    equivalent_terms: "Information Security.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g1h2i3j4-k5l6-4m7n-8o9p-q0r1s2t3u4v5g1",
    chinese_name: "湿租协议",
    english_name: "Damp Lease Agreement",
    definition: "一种商业湿租协议，不包括ACMI租赁协议的所有要素。\n参见：ACMI租赁协议(ACMI Lease Agreement), 全服务湿租协议(Wet Lease Agreement)。",
    equivalent_terms: "",
    see_also: "ACMI Lease Agreement, Wet Lease Agreement",
    see_also_array: ["ACMI Lease Agreement", "Wet Lease Agreement"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h2i3j4k5-l6m7-4n8o-9p0q-r1s2t3u4v5w6h2",
    chinese_name: "危险品 (DG)",
    english_name: "Dangerous Goods (DG)",
    definition: "能够对健康、安全、财产或环境构成危害，并在技术说明或危险品规则(DGR)的危险品清单中列出，或根据这些说明或规则分类的物品或物质。\n可接触危险品–已装载到货机上，且在飞行中允许机组成员或其他授权人员接触的危险品货物。\n不可接触危险品–已装载到货机上，且在飞行中不允许接触的危险品货物。\n参见：危险品条例(Dangerous Goods Regulations (DGR)), 技术说明(Technical Instructions)。",
    equivalent_terms: "Hazardous Materials",
    see_also: "Dangerous Goods Regulations (DGR), Technical Instructions",
    see_also_array: ["Dangerous Goods Regulations (DGR)", "Technical Instructions"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i3j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7i3",
    chinese_name: "危险品条例 (DGR)",
    english_name: "Dangerous Goods Regulations (DGR)",
    definition: "由IATA发布的一份文件（手册），旨在为托运人、为运营人提供地面处理服务的提供商提供程序，以便将分类为危险品的物品和物质安全地通过商业航班空运。DGR中的信息源自ICAO《关于空运危险品安全运输的技术说明》（ICAO技术说明）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j4k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8j4",
    chinese_name: "数据库",
    english_name: "Database",
    definition: "任何为快速搜索和检索而特别组织在一个系统中的结构化信息、记录或数据集合。\n电子数据库–通过计算机以电子方式访问和管理信息的数据库。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k5l6m7n8-o9p0-4q1r-2s3t-u4v5w6x7y8z9k5",
    chinese_name: "数据链记录器 (DLR)",
    english_name: "Data Link Recorder (DLR)",
    definition: "用于记录数据链通信消息的飞行记录器，包括上行（至飞机）和下行（从飞机）消息；记录的数据在可行范围内包括消息向飞行机组显示的时间和响应时间。DLR可与FDR、CVR或FDR/CVR/DLR组合单元集成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l6m7n8o9-p0q1-4r2s-3t4u-v5w6x7y8z9a0l6",
    chinese_name: "除冰/防冰程序",
    english_name: "De-/Anti-icing Program",
    definition: "经当局批准，要求运营人遵守清洁飞机概念的程序。典型的程序包括管理计划、除冰/防冰程序；保持时间、飞机检查和报告程序，以及培训和测试。",
    equivalent_terms: "De-icing/Anti-icing Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m7n8o9p0-q1r2-4s3t-4u5v-w6x7y8z9a0b1m7",
    chinese_name: "除冰",
    english_name: "De-Icing",
    definition: "清除飞机表面冰、雪、雪泥或霜的过程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n8o9p0q1-r2s3-4t4u-5v6w-x7y8z9a0b1c2n8",
    chinese_name: "除冰/防冰",
    english_name: "De-icing/Anti-icing",
    definition: "一个结合了除冰和防冰的过程，可在一个或两个步骤中完成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o9p0q1r2-s3t4-4u5v-6w7x-y8z9a0b1c2d3o9",
    chinese_name: "去识别化数据",
    english_name: "De-identified Data",
    definition: "经过处理以防止数据与个人之间建立任何联系的数据。该过程可能包括保留身份信息，这些信息只能在某些情况下由受信任方重新链接。相比之下，匿名或未识别的数据也与个人没有联系，但可能不是通过可信的方式得出的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p0q1r2s3-t4u5-4v6w-7x8y-z9a0b1c2d3e4p0",
    chinese_name: "空勤调遣",
    english_name: "Deadheading",
    definition: "应运营人要求，将非执勤机组成员作为乘客从一地转移到另一地的行为。",
    equivalent_terms: "Crew Positioning",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q1r2s3t4-u5v6-4w7x-8y9z-a0b1c2d3e4f5q1",
    chinese_name: "决策点 (DP)",
    english_name: "Decision Point (DP)",
    definition: "指定的航路点或多个点，超过该点后，如果满足包括燃油在内的规定运行要求，航班可以继续飞行。如果这些要求无法满足，航班将前往指定的备降机场。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r2s3t4u5-v6w7-4x8y-9z0a-b1c2d3e4f5g6r2",
    chinese_name: "决策点 (DP) 计划",
    english_name: "Decision Point (DP) Planning",
    definition: "一种飞行计划方法，利用沿给定航路指定的一个或多个点，如果运营人定义的运行要求（包括所需剩余燃油）得到满足，航班可以继续飞行。如果在任何这样的点上无法满足这些预定义的要求，航班必须前往指定的备降机场。超过最后一个或最终决策点的航班可能无法改道，并可能必须在目的地机场降落。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s3t4u5v6-w7x8-4y9z-0a1b-c2d3e4f5g6h7s3",
    chinese_name: "危险品申报单",
    english_name: "Declaration of Dangerous Goods",
    definition: "参见：托运人危险品申报单(Shipper's Declaration for Dangerous Goods)。",
    equivalent_terms: "",
    see_also: "Shipper's Declaration for Dangerous Goods",
    see_also_array: ["Shipper's Declaration for Dangerous Goods"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t4u5v6w7-x8y9-4z0a-1b2c-d3e4f5g6h7i8t4",
    chinese_name: "缺陷",
    english_name: "Defect",
    definition: "与飞机、飞机发动机或飞机部件相关的任何已确认的异常情况。\n重大缺陷–可能影响飞机安全或导致飞机对人员或财产构成危险的缺陷。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u5v6w7x8-y9z0-4a1b-2c3d-e4f5g6h7i8j9u5",
    chinese_name: "保留维修",
    english_name: "Deferred Maintenance",
    definition: "对飞行安全没有影响的缺陷的必要维修，尚未完成但已记录并重新安排在特定时间或地点完成。\n参见：最低设备清单(MEL)。",
    equivalent_terms: "Hold Item, Deferred Defect",
    see_also: "MEL",
    see_also_array: ["MEL"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v6w7x8y9-z0a1-4b2c-3d4e-f5g6h7i8j9k0v6",
    chinese_name: "缺陷报告",
    english_name: "Defect Reporting",
    definition: "向当局、型号合格证持有人以及发动机或部件制造商正式报告重大的飞机、飞机发动机和飞机部件缺陷。",
    equivalent_terms: "Major Defect Reporting (MDR), Significant Defect Reporting (SDR)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w7x8y9z0-a1b2-4c3d-4e5f-g6h7i8j9k0l1w7",
    chinese_name: "离港控制系统 (DCS)",
    english_name: "Departure Control System (DCS)",
    definition: "一种自动执行值机、运力与载重控制以及航班签派的方法。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x8y9z0a1-b2c3-4d4e-5f6g-h7i8j9k0l1m2x8",
    chinese_name: "被驱逐者",
    english_name: "Deportee",
    definition: "曾合法入境一国或非法入境一国，后被主管当局正式命令离开该国的人员。\n参见：主管当局(Competent Authority)。",
    equivalent_terms: "",
    see_also: "Competent Authority",
    see_also_array: ["Competent Authority"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y9z0a1b2-c3d4-4e5f-6g7h-i8j9k0l1m2n3y9",
    chinese_name: "设计批准持有人 (DAH)",
    english_name: "Design Approval Holder (DAH)",
    definition: "型号合格证、零部件制造人批准书或技术标准规定授权书的持有人，或是型号合格证的被许可人。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z0a1b2c3-d4e5-4f6g-7h8i-j9k0l1m2n3o4z0",
    chinese_name: "指定陆地区域",
    english_name: "Designated Land Areas",
    definition: "有关国家指定为搜寻和救援特别困难的陆地区域。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5a1",
    chinese_name: "期望结果",
    english_name: "Desired Outcome",
    definition: "描述相应ISARP有效实施结果的陈述。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2c3d4e5-f6g7-4h8i-9j0k-l1m2n3o4p5q6b2",
    chinese_name: "除虫",
    english_name: "Disinsection",
    definition: "采取卫生措施以控制或杀死飞机、行李、货物、集装箱、商品和邮件中存在的昆虫的程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3d4e5f6-g7h8-4i9j-0k1l-m2n3o4p5q6r7c3",
    chinese_name: "桌面审计",
    english_name: "Desktop Audit",
    definition: "对运营人或提供商的政策和程序进行的非现场文件审查，以确定与ISARPs或GOSARPs的符合程度；可用于规划现场审计；也可能指示受审方文件控制系统的有效性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4e5f6g7-h8i9-4j0k-1l2m-n3o4p5q6r7s8d4",
    chinese_name: "扰乱性旅客",
    english_name: "Disruptive Passenger",
    definition: "在机场或飞机上不遵守行为规则或不听从机场工作人员或机组成员指示，从而扰乱机场或飞机上良好秩序和纪律的旅客。",
    equivalent_terms: "Unruly passenger",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5f6g7h8-i9j0-4k1l-2m3n-o4p5q6r7s8t9e5",
    chinese_name: "远程学习",
    english_name: "Distance Learning",
    definition: "非在教室或与教员/评估员面对面进行的培训或评估，而是通过分发给学生的印刷或电子格式的材料（例如互联网、光盘）进行。",
    equivalent_terms: "Computer-based Training, Computer Training, E-learning",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6g7h8i9-j0k1-4l2m-3n4o-p5q6r7s8t9u0f6",
    chinese_name: "水上迫降",
    english_name: "Ditching",
    definition: "非为此目的设计的飞机有意在水上着陆的计划事件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7h8i9j0-k1l2-4m3n-4o5p-q6r7s8t9u0v1g7",
    chinese_name: "文件",
    english_name: "Documentation",
    definition: "被认为对定义和支持行政或运营职能的执行所必需的书面信息。文件可以通过电子或纸质媒体显示，并可用于各种目的（例如沟通、呈现流程和程序、证明符合性、知识共享）。文件的具体示例包括运营手册、管理手册、质量手册、培训手册和政策手册。\nISM、ISSM和GOSM提及三种类型的电子文件。\n类型1文件（基于URL的文件）\n• 可通过内网、外网或基于互联网的资源获得的文件；文件的受控版本始终以电子方式呈现或显示给用户。此类文件基于URL，通常显示为html页面。\n• 特点-受控内容通过电子媒介以内部网、外部网或网页的形式显示给用户。\n• 运营人或提供商无法对文件进行修改。\n类型2文件（基于软件的）\n• 可从用户开发或从商业提供商获取的软件（例如电子飞行包、文件管理系统）中获得的文件；文件的受控版本始终以电子方式呈现或显示给用户。\n• 此类程序中信息的常见标识符可以是框架或模块，用户可以通过这些框架或模块导航（例如EFB的“FCOM”、“起飞”、“重量和平衡”及其他功能区域的模块）。这些框架或模块大多可以通过指向相应模块的路径或标题来引用。\n• 特点-受控内容通过电子媒介在各种软件应用程序中显示给用户。\n• 文件的修改可以由运营人或提供商发起，但由另一实体执行。\n类型3文件（服务器上的文件）\n• 可从服务器文件（例如.doc、.pdf文件）中获得并通过组织范围的网络（例如MS SharePoint）访问的文件。文件的受控版本可以由运营人定义，以电子方式或纸质形式呈现或显示。此类文件的每个版本必须显示版本标识符和生效日期。\n• 特点-受控内容通过电子媒介以常规用户文件的形式显示给用户，或以纸质文件的印刷形式显示；无论是以电子方式还是纸质形式显示，都必须包括版本标识符和生效日期。\n• 文件的修改可以由运营人或提供商发起、执行和控制。\n参见：受控文件(Controlled Document), 电子文件(Electronic Documentation), 纸质文件(Paper Documentation)。",
    equivalent_terms: "",
    see_also: "Controlled Document, Electronic Documentation, Paper Documentation",
    see_also_array: ["Controlled Document", "Electronic Documentation", "Paper Documentation"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8i9j0k1-l2m3-4n4o-5p6q-r7s8t9u0v1w2h8",
    chinese_name: "文件化",
    english_name: "Documented",
    definition: "运营规范由运营人或提供商在受控文件中发布并准确表述的状态。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9j0k1l2-m3n4-4o5p-6q7r-s8t9u0v1w2x3i9",
    chinese_name: "文件化信息 (IEnvA)",
    english_name: "Documented Information (IEnvA)",
    definition: "根据批准的文件管理要求，以物理或电子方式控制和维护的信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j0k1l2m3-n4o5-4p6q-7r8s-t9u0v1w2x3y4j0",
    chinese_name: "国内航班",
    english_name: "Domestic Flight",
    definition: "在一个国家或地区领土内的机场之间进行的航班。",
    equivalent_terms: "Domestic Operations",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1l2m3n4-o5p6-4q7r-8s9t-u0v1w2x3y4z5k1",
    chinese_name: "飘降",
    english_name: "Driftdown",
    definition: "多引擎飞机在航路中一台发动机失效后下降至计划（或预定）高度的过程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2m3n4o5-p6q7-4r8s-9t0u-v1w2x3y4z5a6l2",
    chinese_name: "飘降（高度）",
    english_name: "Driftdown (Altitude)",
    definition: "双引擎飞机在航路中一台发动机失效后，根据计划的飞机重量可以维持的最高高度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3n4o5p6-q7r8-4s9t-0u1v-w2x3y4z5a6b7m3",
    chinese_name: "飘降（性能）",
    english_name: "Driftdown (Performance)",
    definition: "通过限制起飞重量以限制航路重量，从而在关键地形区域最大化飘降高度的最低飞机性能水平。对于关键地形区域，飘降性能被最大化，以便以运营人或当局可接受的余度清除沿预定航路的所有地形。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4o5p6q7-r8s9-4t0u-1v2w-x3y4z5a6b7c8n4",
    chinese_name: "干租",
    english_name: "Dry Lease",
    definition: "通过承租人与出租人之间的商业租赁协议租赁设备，并由承租人操作该设备的做法。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5p6q7r8-s9t0-4u1v-2w3x-y4z5a6b7c8d9o5",
    chinese_name: "干跑道",
    english_name: "Dry Runway",
    definition: "在所需长度和宽度内没有污染物和可见水分的跑道状态。\n参见：污染跑道(Contaminated Runway), 湿跑道(Wet Runway)。",
    equivalent_terms: "",
    see_also: "Contaminated Runway, Wet Runway",
    see_also_array: ["Contaminated Runway", "Wet Runway"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6q7r8s9-t0u1-4v2w-3x4y-z5a6b7c8d9e0p6",
    chinese_name: "双重检查",
    english_name: "Dual Inspection",
    definition: "参见：独立检查(Independent Inspection)。",
    equivalent_terms: "",
    see_also: "Independent Inspection",
    see_also_array: ["Independent Inspection"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7r8s9t0-u1v2-4w3x-4y5z-a6b7c8d9e0f1q7",
    chinese_name: "EDTO临界燃油",
    english_name: "EDTO Critical Fuel",
    definition: "考虑到在航路中最关键点，发生运营人所在国定义的最限制性系统故障时，飞往航路备降机场所需的燃油量。\n参见：延时运行(EDTO (Extended Diversion Time Operations))。",
    equivalent_terms: "",
    see_also: "EDTO (Extended Diversion Time Operations)",
    see_also_array: ["EDTO (Extended Diversion Time Operations)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8s9t0u1-v2w3-4x4y-5z6a-b7c8d9e0f1g2r8",
    chinese_name: "EDTO重要系统",
    english_name: "EDTO Significant System",
    definition: "一种飞机系统，其故障或性能下降可能对EDTO航班的特定安全产生不利影响，或者其持续功能对EDTO备降期间飞机的安全飞行和着陆特别重要。\n参见：延时运行(EDTO (Extended Diversion Time Operations))。",
    equivalent_terms: "",
    see_also: "EDTO (Extended Diversion Time Operations)",
    see_also_array: ["EDTO (Extended Diversion Time Operations)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9t0u1v2-w3x4-4y5z-6a7b-c8d9e0f1g2h3s9",
    chinese_name: "有效",
    english_name: "Effective",
    definition: "在评估工具中指定的期望结果，当一个ISARP被评估为已文件化和已实施，并且定义的适用性和有效性标准得到满足时，即为实现。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0u1v2w3-x4y5-4z6a-7b8c-d9e0f1g2h3i4t0",
    chinese_name: "有效性 (IEnvA)",
    english_name: "Effectiveness (IEnvA)",
    definition: "计划效果达成的程度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1v2w3x4-y5z6-4a7b-8c9d-e0f1g2h3i4j5u1",
    chinese_name: "有效性标准",
    english_name: "Effectiveness Criteria",
    definition: "评估工具中规定的一套标准，定义了运营人为被评估为有效实施选定的ISARPs/GOSARPs所需具备的条件。\n参见：评估工具(Assessment Tool)。",
    equivalent_terms: "",
    see_also: "Assessment Tool",
    see_also_array: ["Assessment Tool"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2w3x4y5-z6a7-4b8c-9d0e-f1g2h3i4j5k6v2",
    chinese_name: "电子飞行包 (EFB)",
    english_name: "Electronic Flight Bag (EFB)",
    definition: "主要用于驾驶舱或客舱的电子显示系统。EFB设备可以显示各种航空数据（例如检查单、导航图、飞机操作手册(AOM)）或执行基本计算（例如性能数据、燃油计算）。EFB系统功能的范围还可能包括各种其他托管的数据库和应用程序。物理EFB设备可能使用各种技术、格式和通信形式。\n物理EFB显示器可以是便携式的（1类）、固定在批准的安装设备上的（2类）或内置于飞机中的（3类）。\n• 1类EFB被视为便携式电子设备(PED)，是飞行员飞行包的一部分，通常不固定在飞机上或连接到其系统，除非是为了给内置电池充电。通常，手提式、商业现成的系统，1类EFB可能能够连接到与航空电子/飞机系统完全隔离的系统（例如，EFB系统连接到仅在地面上接收和传输AAC目的数据的传输介质）。1类EFB通常不受适航要求或批准的限制；\n• 2类EFB仍被视为PED，并具有1类EFB的所有功能，但它通常通过安装设备固定在飞机上，连接到一个或多个数据源、硬接线电源和/或已安装的天线。由于2类EFB能够从飞机总线读取数据，它们通常受适航要求或批准的限制；\n• 3类EFB本质上是一个受适航要求和批准的航空电子系统。这些范围从面板安装的多功能显示器(MFD)到定制的集成适航系统。\n参见：电子海图显示(Electronic Chart Display (ECD)), 电子检查单(Electronic Checklist (ECL)), 个人电子设备(Personal Electronic Device (PED))。",
    equivalent_terms: "",
    see_also: "Electronic Chart Display (ECD), Electronic Checklist (ECL), Personal Electronic Device (PED)",
    see_also_array: ["Electronic Chart Display (ECD)", "Electronic Checklist (ECL)", "Personal Electronic Device (PED)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3x4y5z6-a7b8-4c9d-0e1f-g2h3i4j5k6l7w3",
    chinese_name: "电子海图显示 (ECD)",
    english_name: "Electronic Chart Display (ECD)",
    definition: "一种显示设备，提供交互式信息和/或预先组合信息的全面描绘，其功能相当于纸质航图。ECD可以是便携式设备或安装在飞机仪表板上。ECD不是根据技术标准规定(TSO)设计的永久安装在飞机上的多功能显示器(MFD)。但是，MFD可能包含描绘检查单、导航图、POH以及其他相关数据或信息的数据库。\n参见：电子飞行包(Electronic Flight Bag (EFB)), 电子检查单(Electronic Checklist (ECL)), 个人电子设备(Personal Electronic Device (PED))。",
    equivalent_terms: "",
    see_also: "Electronic Flight Bag (EFB), Electronic Checklist (ECL), Personal Electronic Device (PED)",
    see_also_array: ["Electronic Flight Bag (EFB)", "Electronic Checklist (ECL)", "Personal Electronic Device (PED)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4y5z6a7-b8c9-4d0e-1f2g-h3i4j5k6l7m8x4",
    chinese_name: "电子检查单 (ECL)",
    english_name: "Electronic Checklist (ECL)",
    definition: "通过电子设备向飞行机组显示的检查单。\n参见：电子海图显示(Electronic Chart Display (ECD)), 电子飞行包(Electronic Flight Bag (EFB)), 个人电子设备(Personal Electronic Device (PED))。",
    equivalent_terms: "",
    see_also: "Electronic Chart Display (ECD), Electronic Flight Bag (EFB), Personal Electronic Device (PED)",
    see_also_array: ["Electronic Chart Display (ECD)", "Electronic Flight Bag (EFB)", "Personal Electronic Device (PED)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5z6a7b8-c9d0-4e1f-2g3h-i4j5k6l7m8n9y5",
    chinese_name: "电子文件",
    english_name: "Electronic Documentation",
    definition: "以电子方式开发和维护，并通过电子媒体向用户呈现或显示的文件。\n注：所有类型的电子文件都受到保护，防止未经授权的人员访问和修改，以确保文件控制。\n参见：文件(Documentation)。",
    equivalent_terms: "",
    see_also: "Documentation",
    see_also_array: ["Documentation"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6a7b8c9-d0e1-4f2g-3h4i-j5k6l7m8n9o0z6",
    chinese_name: "静电放电 (ESD) 程序",
    english_name: "Electrostatic Discharge (ESD) Program",
    definition: "概述处理ESD分类飞机部件所需预防措施的程序。",
    equivalent_terms: "ESDS, ESD, ESD Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7b8c9d0-e1f2-4g3h-4i5j-k6l7m8n9o0p1a7",
    chinese_name: "应急设备",
    english_name: "Emergency Equipment",
    definition: "专门用于飞机紧急情况的飞机设备。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8c9d0e1-f2g3-4h4i-5j6k-l7m8n9o0p1q2b8",
    chinese_name: "紧急出口",
    english_name: "Emergency Exit",
    definition: "门、窗出口或任何其他类型的出口（例如舱口、尾锥出口），用作出口门户，以便在适当的时间内为客舱疏散提供最大机会。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9d0e1f2-g3h4-4i5j-6k7l-m8n9o0p1q2r3c9",
    chinese_name: "应急机场",
    english_name: "Emergency Airport",
    definition: "通常不被运营人用于正常运营的非航线机场，可在紧急情况下使用。应急机场通常根据预期的支持、设施和风险水平进行分类，仅在航班因特定紧急情况无法继续前往其目的地或适当备降场时使用。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0e1f2g3-h4i5-4j6k-7l8m-n9o0p1q2r3s4d0",
    chinese_name: "应急逃生通道照明系统",
    english_name: "Emergency Escape Path Lighting System",
    definition: "一种飞机客舱应急照明系统，旨在在黑暗、烟雾或火灾的情况下为乘客和机组人员提供通往紧急出口路径的照明视觉指示。",
    equivalent_terms: "Emergency Exit Path Lighting System, Emergency Exit Path Illumination System, Floor Proximity Emergency Lighting",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1f2g3h4-i5j6-4k7l-8m9n-o0p1q2r3s4t5e1",
    chinese_name: "应急照明系统",
    english_name: "Emergency Lighting System",
    definition: "设计用于紧急情况的照明系统，独立于飞机主电源，并在正常电源丢失时自动激活。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2g3h4i5-j6k7-4l8m-9n0o-p1q2r3s4t5u6f2",
    chinese_name: "应急定位发射器 (ELT)",
    english_name: "Emergency Locator Transmitter (ELT)",
    definition: "一个通用术语，描述在指定频率上广播独特信号的设备，根据应用，可以通过撞击自动激活或手动激活。ELT的类型定义如下：\n自动固定式ELT(AF)–永久固定在飞机上并自动激活。\n自动便携式ELT(AP)–牢固地固定在飞机上并自动激活，但可以随时从飞机上取下。\n自动可部署式ELT(A/D)–牢固地固定在飞机上，并通过撞击自动部署和激活；在某些情况下，也通过静水压力传感器。也提供手动部署。\n救生型ELT(S)–可从飞机上取下，存放在便于在紧急情况下随时使用的地方，并由幸存者手动激活。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3h4i5j6-k7l8-4m9n-0o1p-q2r3s4t5u6v7g3",
    chinese_name: "应急管理中心 (EMC)",
    english_name: "Emergency Management Center (EMC)",
    definition: "一旦应急响应被激活，由运营人建立的协调中心。通常，它将包括人员配备、通信设备、文件和日志、用于保管记录的设施以及参考资料。运营人可以将此功能分包给另一家航空公司或专业组织。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4i5j6k7-l8m9-4n0o-1p2q-r3s4t5u6v7w8h4",
    chinese_name: "应急响应计划 (ERP)",
    english_name: "Emergency Response Plan (ERP)",
    definition: "一个正式的计划，定义了在紧急（或危机）情况后采取的行动，以确保从正常运营到紧急运营的有序高效过渡，然后在可能的情况下尽快安全地继续运营或恢复正常运营。ERP规定了：\n• 紧急权力的授予和紧急责任的分配；\n• 关键人员采取行动的授权；\n• 应对紧急情况的努力协调。\n注：ERP是根据重大飞机事故或其他导致死亡、重伤、重大损失和/或运营严重中断的不良事件来定义的。",
    equivalent_terms: "Emergency Management Plan, Crisis Management Plan",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5j6k7l8-m9n0-4o1p-2q3r-s4t5u6v7w8x9i5",
    chinese_name: "认可培训机构 (ETO)",
    english_name: "Endorsed Training Organization (ETO)",
    definition: "经IATA认可，作为IOSA/ISSA下培训服务提供者的公司或其他实体。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6k7l8m9-n0o1-4p2q-3r4s-t5u6v7w8x9y0j6",
    chinese_name: "发动机（飞机）",
    english_name: "Engine (Aircraft)",
    definition: "由发动机制造商提供的基本飞机发动机组件及其基本附件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7l8m9n0-o1p2-4q3r-4s5t-u6v7w8x9y0z1k7",
    chinese_name: "工程师，飞机维修 (AME)",
    english_name: "Engineer, Aircraft Maintenance (AME)",
    definition: "受雇执行通常与飞机维修相关的职责，但不持有飞机维修工程师执照的人员。",
    equivalent_terms: "Mechanic, Technician",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8m9n0o1-p2q3-4r4s-5t6u-v7w8x9y0z1a2l8",
    chinese_name: "工程师，持照飞机维修 (LAME)",
    english_name: "Engineer, Licensed Aircraft Maintenance (LAME)",
    definition: "受雇执行通常与飞机维修相关的职责，并持有飞机工程师执照的人员。该人员可被授予维修授权，以认证LAME未评级的飞机类型和类别的维修。",
    equivalent_terms: "Aircraft Maintenance Technician (AMT), A and P Mechanic",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9n0o1p2-q3r4-4s5t-6u7v-w8x9y0z1a2b3m9",
    chinese_name: "工程授权 (EA)",
    english_name: "Engineering Authorization (EA)",
    definition: "由设计组织从运营人（或由其签约）发出的文件，该文件（代表运营人）表明如何证明符合适用的适航要求，以便在运营人的责任下认证型号设计的修改或修理。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0o1p2q3-r4s5-4t6u-7v8w-x9y0z1a2b3c4n0",
    chinese_name: "工程指令 (EI)",
    english_name: "Engineering Instruction (EI)",
    definition: "由运营人的技术服务或工程部门制作的文件，规定了遵守以下要求的指令：\n• 适航指令(AD)和服务通告(SB)；\n• 飞机改装和/或修理；\n• 部件改装和/或修理；\n• 涉及设计考虑的时间限制；\n• 代替改装的检查；或\n• 可通过修理或改装行动终止的检查；\n• 向供应部门和/或生产部门提供建议或授权，以涵盖采购、保修或制造标准。",
    equivalent_terms: "Engineering Order (EO), Maintenance Instructions, Engineering Request (ER)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1p2q3r4-s5t6-4u7v-8w9x-y0z1a2b3c4d5o1",
    chinese_name: "工程订单 (EO)",
    english_name: "Engineering Order (EO)",
    definition: "参见：工程指令(Engineering Instruction)。",
    equivalent_terms: "EO, ER, EI",
    see_also: "Engineering Instruction",
    see_also_array: ["Engineering Instruction"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2q3r4s5-t6u7-4v8w-9x0y-z1a2b3c4d5e6p2",
    chinese_name: "工程请求 (ER)",
    english_name: "Engineering Request (ER)",
    definition: "参见：工程指令(Engineering Instruction)。",
    equivalent_terms: "EO, EI",
    see_also: "Engineering Instruction",
    see_also_array: ["Engineering Instruction"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3r4s5t6-u7v8-4w9x-0y1z-a2b3c4d5e6f7q3",
    chinese_name: "增强型近地警告系统 (EGPWS)",
    english_name: "Enhanced Ground Proximity Warning System (EGPWS)",
    definition: "参见：具有前视地形规避功能的近地警告系统(Ground Proximity Warning System with a Forward Looking Terrain Avoidance Function)。",
    equivalent_terms: "",
    see_also: "Ground Proximity Warning System with a Forward Looking Terrain Avoidance Function",
    see_also_array: ["Ground Proximity Warning System with a Forward Looking Terrain Avoidance Function"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4s5t6u7-v8w9-4x0y-1z2a-b3c4d5e6f7g8r4",
    chinese_name: "增强视觉系统 (EVS)",
    english_name: "Enhanced Vision System (EVS)",
    definition: "一个通过使用图像传感器显示外部场景的电子实时图像的系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5t6u7v8-w9x0-4y1z-2a3b-c4d5e6f7g8h9s5",
    chinese_name: "环境",
    english_name: "Environment",
    definition: "外部和内部的自然和人类环境，通常包括空气、水、土地、植物和动物（包括人）以及自然资源。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6u7v8w9-x0y1-4z2a-3b4c-d5e6f7g8h9i0t6",
    chinese_name: "环境因素 (IEnvA)",
    english_name: "Environmental Aspect (IEnvA)",
    definition: "与环境相互作用或可能相互作用的活动、产品或服务的元素或特征。环境因素可能导致环境影响。它们可能产生有益的影响或不利的影响，并可能对环境产生直接和决定性的影响，或仅部分或间接地促成更大的环境变化。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7v8w9x0-y1z2-4a3b-4c5d-e6f7g8h9i0j1u7",
    chinese_name: "环境影响 (IEnvA)",
    english_name: "Environmental Impact (IEnvA)",
    definition: "由一个或多个环境因素部分或全部引起的环境变化。一个环境因素既可能对环境产生直接影响，也可能部分或间接地促成更大的环境变化。此外，它既可能产生有益的环境影响，也可能产生不利的环境影响。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8w9x0y1-z2a3-4b4c-5d6e-f7g8h9i0j1k2v8",
    chinese_name: "环境影响类别 (IEnvA)",
    english_name: "Environmental Impact Categories (IEnvA)",
    definition: "直接或间接影响自然环境或生态（包括人类）的环境影响，可分为以下几大类：空气（包括气味）、噪音、废物、废水、资源利用、生物多样性、土地。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9x0y1z2-a3b4-4c5d-6e7f-g8h9i0j1k2l3w9",
    chinese_name: "环境管理改进 (IEnvA)",
    english_name: "Environmental Management Improvement (IEnvA)",
    definition: "运营人为改进IEnvA相关活动和建议做法的整体管理而执行的任务。环境管理改进可能包括通过提供实际数据来改进数据测量，而无论任何环境指标的增加或减少。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0y1z2a3-b4c5-4d6e-7f8g-h9i0j1k2l3m4x0",
    chinese_name: "环境管理体系 (IEnvA)",
    english_name: "Environmental Management System (IEnvA)",
    definition: "在组织内管理环境项目和问题的系统化方法；包括确保遵守环境法规和在活动中保护环境的结构、规划和资源。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1z2a3b4-c5d6-4e7f-8g9h-i0j1k2l3m4n5y1",
    chinese_name: "环境目标 (IEnvA)",
    english_name: "Environmental Objective (IEnvA)",
    definition: "运营人意图实现的环境成果。目标应基于或源于环境政策，并且必须与该政策一致。目标可以由多个短期目标组成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2a3b4c5-d6e7-4f8g-9h0i-j1k2l3m4n5o6z2",
    chinese_name: "环境绩效",
    english_name: "Environmental Performance",
    definition: "当活动、流程、产品、服务、系统和组织的环境方面得到管理和控制时所取得的成果。当活动、流程、产品、服务、系统和组织的环境方面得到管理和控制，并且不利的环境影响减少、有益的环境影响产生时，环境绩效就会得到改善。环境绩效可以通过使用指标，将环境成果与环境目标和环境政策（或其他合适的标准）进行比较来衡量。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3b4c5d6-e7f8-4g9h-0i1j-k2l3m4n5o6p7a3",
    chinese_name: "环境绩效改善 (IEnvA)",
    english_name: "Environmental Performance Improvement (IEnvA)",
    definition: "可能为实际或标准化的环境指标（相对）影响的可量化改善。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4c5d6e7-f8g9-4h0i-1j2k-l3m4n5o6p7q8b4",
    chinese_name: "环境政策",
    english_name: "Environmental Policy",
    definition: "由组织最高管理层正式声明的承诺、方向、愿景或意图。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5d6e7f8-g9h0-4i1j-2k3l-m4n5o6p7q8r9c5",
    chinese_name: "环境目标 (IEnvA)",
    english_name: "Environmental Target (IEnvA)",
    definition: "适用于运营人全部或部分活动的详细绩效要求，源自环境目标。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6e7f8g9-h0i1-4j2k-3l4m-n5o6p7q8r9s0d6",
    chinese_name: "设备限制区 (ERA)",
    english_name: "Equipment Restraint Area (ERA)",
    definition: "停机坪上由红线（称为设备限制线）或以其他方式标示的区域，飞机在地面操作期间停放在此区域。",
    equivalent_terms: "Equipment Safety Area",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7f8g9h0-i1j2-4k3l-4m5n-o6p7q8r9s0t1e7",
    chinese_name: "差错（飞行机组）",
    english_name: "Error (Flight Crew)",
    definition: "飞行机组的作为或不作为，导致偏离组织或飞行机组的意图或期望。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8g9h0i1-j2k3-4l4m-5n6o-p7q8r9s0t1u2f8",
    chinese_name: "差错管理",
    english_name: "Error Management",
    definition: "通过减少或消除差错后果并降低未来差错或不良飞机状态概率的对策来发现和应对差错的过程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9h0i1j2-k3l4-4m5n-6o7p-q8r9s0t1u2v3g9",
    chinese_name: "预计使用时间 (ETU)",
    english_name: "Estimated Time of Use (ETU)",
    definition: "一个机场将作为起飞点、目的地、航路备降场或目的地备降场使用的时间、时间段或时间窗口。ETU通常由运营人在飞行前计划和/或飞行中重新计划阶段确定，以考虑飞行时间估算、气象事件和其他可能限制机场用于起飞或到达的可用性的运营条件的不确定性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0i1j2k3-l4m5-4n6o-7p8q-r9s0t1u2v3w4h0",
    chinese_name: "ETO认证协议",
    english_name: "ETO Accreditation Agreement",
    definition: "由IATA和认可培训机构(ETO)签署的法律文件，规定了IATA对该ETO认证的相关条款和条件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1j2k3l4-m5n6-4o7p-8q9r-s0t1u2v3w4x5i1",
    chinese_name: "ETO会议",
    english_name: "ETO Meeting",
    definition: "由IATA组织，由ETO代表和其他受邀方参加的会议，旨在处理与IOSA审计员培训(IAT)课程相关的问题。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2k3l4m5-n6o7-4p8q-9r0s-t1u2v3w4x5y6j2",
    chinese_name: "ETOPS",
    english_name: "ETOPS",
    definition: "指多发飞机在某些航线上运行的缩写，这些航线在某个点上超过了国家规定的飞往着陆机场的飞行时间；ETOPS需要监管批准。\n注：ETOPS缩写有多种定义，但通常涵盖传统上称为“延程双发运行”（EASA仅限双发）、“远程运行”（EASA LROPS，适用于三发和四发飞机）、“延程双发运行”、“延程双发运营”、“延展运行”（FAA）、“延程运行（EROPS）”、“延程双发运行性能标准”和“延时运行”（CASA澳大利亚）的经批准的多发运行。",
    equivalent_terms: "Extended Diversion Time Operations (EDTO)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3l4m5n6-o7p8-4q9r-0s1t-u2v3w4x5y6z7k3",
    chinese_name: "评估",
    english_name: "Evaluation",
    definition: "确定一个项目、个人或活动是否满足特定标准的过程；当与培训结合使用时，指评估员或教员确定学生表现如何满足课程能力的过程；过程可包括知识、熟练度和/或能力的展示。",
    equivalent_terms: "Examination, Testing, Checking, Assessment",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4m5n6o7-p8q9-4r0s-1t2u-v3w4x5y6z7a8l4",
    chinese_name: "评估计划",
    english_name: "Evaluation Program",
    definition: "用于确定一个项目、个人或活动是否满足特定标准的书面管理、组织、策略、政策和程序。",
    equivalent_terms: "Self-Audit, Self-Evaluation, Audit Program, Audit Schedule, Audit Plan",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5n6o7p8-q9r0-4s1t-2u3v-w4x5y6z7a8b9m5",
    chinese_name: "评估员",
    english_name: "Evaluator",
    definition: "评估、检查或判断机组成员、教员、其他评估员或其他运营人员表现的人员。\n注：在IOSA/ISSA下，评估员是经验丰富的主任审计员，已证明具备必要素质并被AO指定评估审计活动和审计员表现。\n注：在ISAGO下，评估员应为指定的ISAGO审计员，负责评估候选审计员的整体表现。",
    equivalent_terms: "Examiner",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6o7p8q9-r0s1-4t2u-3v4w-x5y6z7a8b9c0n6",
    chinese_name: "证据",
    english_name: "Evidence",
    definition: "在审计期间发现的数据或信息，由审计员分析并用于确定与审计所依据的标准的符合性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7p8q9r0-s1t2-4u3v-4w5x-y6z7a8b9c0d1o7",
    chinese_name: "实证训练 (EBT)",
    english_name: "Evidence-based Training (EBT)",
    definition: "基于运营数据并以发展和评估受训者在一系列能力方面的整体能力为特征的培训和评估计划（而不是通过测量单个事件或机动的表现）。",
    equivalent_terms: "Advanced Qualification Program, Alternative Training and Qualification Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8q9r0s1-t2u3-4v4w-5x6y-z7a8b9c0d1e2p8",
    chinese_name: "豁免",
    english_name: "Exemption",
    definition: "由相应国家当局授予的批准以外的授权，提供在相应国家当局规定的条件下免除法规要求的规定。\n注：在IOSA计划下，豁免可根据IPM的规定授予。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9r0s1t2-u3v4-4w5x-6y7z-a8b9c0d1e2f3q9",
    chinese_name: "加速行李",
    english_name: "Expedited Baggage",
    definition: "由于处理不当、航班衔接错误或其他原因，未能在原定航班上到达原目的地供乘客提取，而被以加速方式运往其原始目的站的行李。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0s1t2u3-v4w5-4x6y-7z8a-b9c0d1e2f3g4r0",
    chinese_name: "出口适航证书",
    english_name: "Export Certificate of Airworthiness",
    definition: "由一国（出口国）的NAA向另一国（进口国）的NAA签发的声明，以提供飞机符合适航要求的书面证明。该证书不授权飞机的运行。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1t2u3v4-w5x6-4y7z-8a9b-c0d1e2f3g4h5s1",
    chinese_name: "延时运行 (EDTO)",
    english_name: "Extended Diversion Time Operations (EDTO)",
    definition: "任何由两台或多台涡轮发动机飞机进行的运行，其中飞往航路备降机场的备降时间大于运营人所在国定义的阈值时间。\n注：EDTO是ICAO适用于经批准的多发飞机运行的术语，涵盖传统上称为ETOPS的运行。监管批准通常在AOC/运行规范中指定，适用于被授权超过运营人所在国定义的阈值时间的飞机。阈值时间和其他运行要求可能因飞机类型、配置和发动机数量而异。\n注：就ISM而言，ETOPS批准等同于EDTO批准。\n参见：ETOPS(ETOPS), 阈值时间(Threshold Time)。",
    equivalent_terms: "",
    see_also: "ETOPS, Threshold Time",
    see_also_array: ["ETOPS", "Threshold Time"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2u3v4w5-x6y7-4z8a-9b0c-d1e2f3g4h5i6t2",
    chinese_name: "情有可原的情况",
    english_name: "Extenuating Circumstances",
    definition: "减轻并降低一方完成规定行动的能力或责任的情形或因素。在IPM中，该术语用于处理或描述超出运营人控制范围的情况。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3v4w5x6-y7z8-4a9b-0c1d-e2f3g4h5i6j7u3",
    chinese_name: "外部飞机检查（绕机检查）",
    english_name: "Exterior Aircraft Inspection (Walkaround)",
    definition: "每次飞行前由飞行机组成员、持照飞机维修技师或其他适当合格的个人对飞机外部进行的目视检查（即“绕机检查”），以观察飞机的关键区域，确定是否存在任何可能影响飞行安全的异常或差异。\n注：外部飞机检查不满足法规要求的作为适航性检查的检查，该检查必须由持照飞机维修技师进行（例如工程适航检查、每日检查）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4w5x6y7-z8a9-4b0c-1d2e-f3g4h5i6j7k8v4",
    chinese_name: "家属援助",
    english_name: "Family Assistance",
    definition: "在飞机事故后实施运营人应急响应计划(ERP)期间提供的服务和信息，以满足乘客、机组成员及其家属的关键支持领域，并解决他们的关切和需求。\n参见：应急响应计划(Emergency Response Plan (ERP))。",
    equivalent_terms: "",
    see_also: "Emergency Response Plan (ERP)",
    see_also_array: ["Emergency Response Plan (ERP)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5x6y7z8-a9b0-4c1d-2e3f-g4h5i6j7k8l9w5",
    chinese_name: "家庭成员",
    english_name: "Family Member",
    definition: "父母、兄弟姐妹、子女、配偶、祖父母或孙子女。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6y7z8a9-b0c1-4d2e-3f4g-h5i6j7k8l9m0x6",
    chinese_name: "疲劳",
    english_name: "Fatigue",
    definition: "由于睡眠不足、长时间清醒、昼夜节律相位和/或工作负荷（精神和/或体力活动）导致的心理或身体表现能力下降的生理状态，会损害一个人的警觉性和执行与安全相关的操作职责的能力。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7z8a9b0-c1d2-4e3f-4g5h-i6j7k8l9m0n1y7",
    chinese_name: "疲劳风险管理系统 (FRMS)",
    english_name: "Fatigue Risk Management System (FRMS)",
    definition: "一种基于科学原理和知识以及运营经验的数据驱动方法，用于持续监控和管理与疲劳相关的安全风险，旨在确保相关人员在足够的警觉水平下工作。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8a9b0c1-d2e3-4f4g-5h6i-j7k8l9m0n1o2z8",
    chinese_name: "调机飞行",
    english_name: "Ferry Flight",
    definition: "为任何原因调动飞机的非商业飞行。",
    equivalent_terms: "Positioning Flight",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9b0c1d2-e3f4-4g5h-6i7j-k8l9m0n1o2p3a9",
    chinese_name: "发现项",
    english_name: "Finding",
    definition: "基于事实证据的文件化陈述，描述了与IOSA/ISSA/ISAGO标准的不符合性。\n注：术语“发现项”(Finding)特指与IOSA/ISSA/ISAGO标准的不符合性，而术语“发现项”(finding)是通用的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0c1d2e3-f4g5-4h6i-7j8k-l9m0n1o2p3q4b0",
    chinese_name: "副驾驶",
    english_name: "First Officer",
    definition: "参见：副驾驶(Second-in-command)。",
    equivalent_terms: "",
    see_also: "Second-in-command",
    see_also_array: ["Second-in-command"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1d2e3f4-g5h6-4i7j-8k9l-m0n1o2p3q4r5c1",
    chinese_name: "固定平台",
    english_name: "Fixed Platform",
    definition: "从岸边延伸至水面以上，由柱子或桩支撑以固定位置的平台或码头，旨在与水上飞机并排停靠，用于乘客上下、货物装卸、加油和水上飞机停放。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2e3f4g5-h6i7-4j8k-9l0m-n1o2p3q4r5s6d2",
    chinese_name: "飞行机组",
    english_name: "Flight Crew",
    definition: "操作飞机所必需的机组成员，其人数和组成不得少于运营手册中规定的数量，并应包括在飞行手册或与适航证书相关的其他文件中规定的最低数量之外的飞行机组成员，当考虑到所用飞机类型、所涉运行类型以及更换飞行机组地点之间的飞行持续时间时，这是必需的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3f4g5h6-i7j8-4k9l-0m1n-o2p3q4r5s6t7e3",
    chinese_name: "飞行机组通告",
    english_name: "Flight Crew Bulletin",
    definition: "一份临时或永久的文件或指令，可能不属于运营手册的一部分，其中包含针对飞行机组成员的运营信息、指导和/或指示。",
    equivalent_terms: "Flight Operations Bulletin",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4g5h6i7-j8k9-4l0m-1n2o-p3q4r5s6t7u8f4",
    chinese_name: "飞行机组成员",
    english_name: "Flight Crew Member",
    definition: "飞行机组的一员。\n参见：飞行机组(Flight Crew)。",
    equivalent_terms: "",
    see_also: "Flight Crew",
    see_also_array: ["Flight Crew"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5h6i7j8-k9l0-4m1n-2o3p-q4r5s6t7u8v9g5",
    chinese_name: "飞行数据分析 (FDA) 计划",
    english_name: "Flight Data Analysis (FDA) Program",
    definition: "一个非惩罚性的计划，用于收集和分析在常规飞行中记录的数据，以改进飞行机组表现、操作程序、飞行训练、空中交通管制程序、空中导航服务或飞机维修和设计。",
    equivalent_terms: "Flight Data Monitoring (FDM) Program, Flight Operations Quality Assurance (FOQA) Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6i7j8k9-l0m1-4n2o-3p4q-r5s6t7u8v9w0h6",
    chinese_name: "飞行数据记录器 (FDR)",
    english_name: "Flight Data Recorder (FDR)",
    definition: "用于记录特定飞机性能参数的飞行记录器。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7j8k9l0-m1n2-4o3p-4q5r-s6t7u8v9w0x1i7",
    chinese_name: "驾驶舱",
    english_name: "Flight Deck",
    definition: "飞机上设计用于使飞行机组操作飞机的区域；包含所需的仪表、控制器、系统和设备，并与飞机的其他区域隔开。",
    equivalent_terms: "Flight Crew Compartment, Cockpit",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8k9l0m1-n2o3-4p4q-5r6s-t7u8v9w0x1y2j8",
    chinese_name: "飞行签派",
    english_name: "Flight Dispatch",
    definition: "参见：运行控制(Operational Control)。",
    equivalent_terms: "",
    see_also: "Operational Control",
    see_also_array: ["Operational Control"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9l0m1n2-o3p4-4q5r-6s7t-u8v9w0x1y2z3k9",
    chinese_name: "飞行签派员",
    english_name: "Flight Dispatcher",
    definition: "参见：飞行运行官员(Flight Operations Officer (FOO))。",
    equivalent_terms: "",
    see_also: "Flight Operations Officer (FOO)",
    see_also_array: ["Flight Operations Officer (FOO)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0m1n2o3-p4q5-4r6s-7t8u-v9w0x1y2z3a4l0",
    chinese_name: "飞行执勤期",
    english_name: "Flight Duty Period",
    definition: "从飞行或客舱机组成员开始执勤，在进行一次或一系列飞行之前，到该飞行或客舱机组成员完成该次或系列飞行后解除所有职责的全部时间。",
    equivalent_terms: "Flight Duty Time",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1n2o3p4-q5r6-4s7t-8u9v-w0x1y2z3a4b5m1",
    chinese_name: "飞行工程师",
    english_name: "Flight Engineer",
    definition: "飞行机组的一员，当飞机设计中包含独立的飞行工程师工作站时，专门指派到该工作站，除非与该工作站相关的职责可以由另一名持有飞行工程师执照的飞行机组成员在不干扰常规职责的情况下令人满意地执行。",
    equivalent_terms: "Second Officer",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2o3p4q5-r6s7-4t8u-9v0w-x1y2z3a4b5c6n2",
    chinese_name: "飞行跟踪",
    english_name: "Flight Following",
    definition: "运营人员实时记录起飞和到达信息，以确保航班正在运行并已到达目的地机场。\n参见：飞行监控(Flight Monitoring), 飞行监视(Flight Watch)。",
    equivalent_terms: "",
    see_also: "Flight Monitoring, Flight Watch",
    see_also_array: ["Flight Monitoring", "Flight Watch"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3p4q5r6-s7t8-4u9v-0w1x-y2z3a4b5c6d7o3",
    chinese_name: "飞行管理系统 (FMS)",
    english_name: "Flight Management System (FMS)",
    definition: "一种计算机化的飞机导航系统，利用惯性导航系统或GPS的位置数据来定位飞机位置，并向飞行机组显示数据和信息以进行导航。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4q5r6s7-t8u9-4v0w-1x2y-z3a4b5c6d7e8p4",
    chinese_name: "飞行监控",
    english_name: "Flight Monitoring",
    definition: "除了飞行跟踪的要求外，飞行监控还包括：\n• 由具备适当资格的运营控制人员（FOO/FOA）从起飞点开始对飞行的所有阶段进行运营监控；\n• 在飞行机组和地面运营控制人员之间沟通所有可用和相关的安全信息；\n• 在发生飞行中紧急情况或安全问题时，或应飞行机组请求时，向飞行机组提供关键援助。\n参见：飞行跟踪(Flight Following), 飞行监视(Flight Watch)。",
    equivalent_terms: "",
    see_also: "Flight Following, Flight Watch",
    see_also_array: ["Flight Following", "Flight Watch"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5r6s7t8-u9v0-4w1x-2y3z-a4b5c6d7e8f9q5",
    chinese_name: "飞行运行助理 (FOA)",
    english_name: "Flight Operations Assistant (FOA)",
    definition: "由运营人指定的具有适当资格的人员或专家，具有与飞行运行的控制和监督相关的特定职责，支持、简报和/或协助FOO和/或机长。",
    equivalent_terms: "Weather Analyst, Navigation Analysts/Flight Planning Specialist, Load Agent, Operations Coordinators/Planner, Maintenance Controller, Air Traffic Specialist and Ground to Air Radio Operator.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6s7t8u9-v0w1-4x2y-3z4a-b5c6d7e8f9g0r6",
    chinese_name: "飞行运行官员 (FOO)",
    english_name: "Flight Operations Officer (FOO)",
    definition: "由运营人指定从事飞行运行控制和监督的人员，无论是否持有执照，在所有运营控制职能（飞行前准备、飞行计划、飞行监控）方面均具备能力，并根据适用的国家要求和/或行业标准具有适当资格，支持、简报和/或协助机长安全执行飞行。\n参见：运行控制(Operational Control)。",
    equivalent_terms: "Flight Dispatcher",
    see_also: "Operational Control",
    see_also_array: ["Operational Control"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7t8u9v0-w1x2-4y3z-4a5b-c6d7e8f9g0h1s7",
    chinese_name: "飞行记录器",
    english_name: "Flight Recorder",
    definition: "为补充事故/事件调查而安装在飞机上的任何类型的记录器。示例包括：\n• 飞行数据记录器(FDR)。\n• 驾驶舱话音记录器(CVR)。\n• 机载图像记录器(AIR)。\n• 数据链记录器(DLR)。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8u9v0w1-x2y3-4z4a-5b6c-d7e8f9g0h1i2t8",
    chinese_name: "飞行安全分析计划",
    english_name: "Flight Safety Analysis Program",
    definition: "一个支持管理职能，专门从事收集和分析运营信息和数据，以识别危险并支持风险管理过程，从而预防与飞机运行相关的事故或事件。典型的计划要素包括：\n• 运营事故、事件和不正常情况的调查；\n• 与监管和调查当局的联络；\n• 飞行数据和信息的收集与分析；\n• 飞行安全和保密人为因素报告的审查与分析；\n• 发布运营安全刊物；\n• 生成运营安全统计数据；\n• 维护飞行安全数据库。",
    equivalent_terms: "Flight Safety Program, Accident Prevention Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9v0w1x2-y3z4-4a5b-6c7d-e8f9g0h1i2j3u9",
    chinese_name: "飞行模拟机",
    english_name: "Flight Simulator",
    definition: "一种复制特定类型、型号和系列飞机驾驶舱并模拟操作飞机体验的设备；包括代表飞机在地面和飞行中运行所需的设备和计算机程序组合，一个提供驾驶舱外视野的视觉系统，以及一个提供至少相当于三自由度运动系统运动提示的力提示系统。\n飞行模拟机根据设备满足的各种技术标准（包括飞机和视觉模拟的保真度、驾驶舱设备和运动能力等）被评估和鉴定为A-D级（或同等级别）。模拟机资格级别通常适用于基于运营人培训计划以及当局批准或接受的相应级别的飞行机组资格培训。\nA级-可用于飞行机组培训的最低模拟机资格级别；适用于程序培训、仪表飞行培训、测试/检查（起飞和着陆机动除外）、复训、型号和仪表等级更新或重新验证测试/检查。\nB级-培训能力高于A级；适用于新近经验培训（起飞和着陆）、过渡或转机型的起飞和着陆机动培训、过渡或转机型的测试和检查（起飞和着陆机动除外）。\nC级-次高级别的模拟机资格级别；适用于根据运营人培训计划中规定的飞行机组经验水平进行的有限零飞行时间训练(ZFTT)。\nD级-最高级别的模拟机资格级别；适用于所有无限制的ZFTT。\n一个同等级别将拥有与定义的A-D级设备相同或基本相似的特性。\n参见：零飞行时间训练(Zero Flight Time Training (ZFTT))。",
    equivalent_terms: "Synthetic Training Device; Full Motion Simulator, Full Flight Simulator, Flight Simulator Training Device (FSTD)",
    see_also: "Zero Flight Time Training (ZFTT)",
    see_also_array: ["Zero Flight Time Training (ZFTT)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0w1x2y3-z4a5-4b6c-7d8e-f9g0h1i2j3k4v0",
    chinese_name: "飞行时间（飞机）",
    english_name: "Flight Time (Aircraft)",
    definition: "从飞机为起飞目的首次移动到飞行结束时最终停止的总时间。\n推出时间(Out Time)–航班开始的时间（飞机首次移动）。\n离地时间(Off Time)–起飞时间。\n着陆时间(On Time)–降落时间。\n停稳时间(In Time)–航班终止的时间（飞机停止）。",
    equivalent_terms: "Block Time",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1x2y3z4-a5b6-4c7d-8e9f-g0h1i2j3k4l5w1",
    chinese_name: "飞行训练设备 (FTD)",
    english_name: "Flight Training Device (FTD)",
    definition: "一种在开放或封闭区域内复制飞机驾驶舱仪表、设备、面板和控制器的设备；包括在设备中安装的系统范围内代表飞机在地面和飞行条件所需的设备和计算机软件组合；不需要力（运动）提示或视觉系统。FTD满足国家监管要求中概述的特定飞行训练或检查标准。",
    equivalent_terms: "Synthetic Training Device",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2y3z4a5-b6c7-4d8e-9f0g-h1i2j3k4l5m6x2",
    chinese_name: "飞行监视",
    english_name: "Flight Watch",
    definition: "除了飞行跟踪和飞行监控中定义的所有要素外，飞行监视还包括由具备适当资格的运营控制人员（FOO/FOA）在飞行的所有阶段对航班进行主动跟踪，以确保航班按照其规定航路飞行，没有计划外的偏离、改道或延误，并在需要时满足国家要求。\n参见：飞行跟踪(Flight Following), 飞行监控(Flight Monitoring)。",
    equivalent_terms: "",
    see_also: "Flight Following, Flight Monitoring",
    see_also_array: ["Flight Following", "Flight Monitoring"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3z4a5b6-c7d8-4e9f-0g1h-i2j3k4l5m6n7y3",
    chinese_name: "浮动平台",
    english_name: "Floating Platform",
    definition: "一个漂浮在开阔水域并放置用于水上飞机操作的平台；授权用于乘客的上下船以及货物的装卸。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4a5b6c7-d8e9-4f0g-1h2i-j3k4l5m6n7o8z4",
    chinese_name: "外来物碎片/损伤 (FOD)",
    english_name: "Foreign Object Debris/Damage (FOD)",
    definition: "一个用于描述可能导致飞机损坏的外来碎片或物品以及由此类碎片造成的飞机损坏的缩写词。\n外来物碎片(FOD)：与飞机或飞机系统无关的物质、碎片或物品，可能造成损害。\n外来物损伤(FOD)：可归因于外来物的任何损害，可以用物理或经济术语表示，可能或可能不降低产品所需的安全和/或性能特性。",
    equivalent_terms: "Foreign Debris Damage",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5b6c7d8-e9f0-4g1h-2i3j-k4l5m6n7o8p9a5",
    chinese_name: "前视风切变告警系统",
    english_name: "Forward-looking Wind Shear Warning System",
    definition: "飞机上用于识别飞机前方和遭遇前可能存在的严重风切变的设备。\n参见：机载风切变告警系统(Airborne Wind Shear Warning System), 风切变(Wind Shear)。",
    equivalent_terms: "",
    see_also: "Airborne Wind Shear Warning System, Wind Shear",
    see_also_array: ["Airborne Wind Shear Warning System", "Wind Shear"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6c7d8e9-f0g1-4h2i-3j4k-l5m6n7o8p9q0b6",
    chinese_name: "安全管理体系框架 (SMS)",
    english_name: "Framework for Safety Management Systems (SMS)",
    definition: "安全管理体系(SMS)的结构，发布于ICAO附件19，包括定义SMS最低要求的四个组成部分和十二个要素。\n参见：安全管理体系(Safety Management System (SMS))。",
    equivalent_terms: "",
    see_also: "Safety Management System (SMS)",
    see_also_array: ["Safety Management System (SMS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7d8e9f0-g1h2-4i3j-4k5l-m6n7o8p9q0r1c7",
    chinese_name: "货运集装箱（仅限放射性材料）",
    english_name: "Freight Container (Radioactive Materials Only)",
    definition: "一种为便于运输放射性物品而设计的运输设备，无需中途转运，必须是：\n• 具有永久性封闭特性；\n• 坚固耐用，足以重复使用；\n• 配备便于搬运的装置。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8e9f0g1-h2i3-4j4k-5l6m-n7o8p9q0r1s2d8",
    chinese_name: "燃料库",
    english_name: "Fuel Farms",
    definition: "储存和向航空公司运营人分发航空级燃料的设施。",
    equivalent_terms: "Joint Holder User Installation (JHUI)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9f0g1h2-i3j4-4k5l-6m7n-o8p9q0r1s2t3e9",
    chinese_name: "燃油（飞行计划）",
    english_name: "Fuel (Flight Planning)",
    definition: "以下术语指在飞行计划过程中使用的燃油值。\n滑行燃油–从发动机启动到开始起飞滑跑所需的燃油。\n航程燃油–从起飞或飞行中重新计划点到在目的地机场着陆的计划飞行所需的总燃油。航程燃油基于准确的消耗数据，并考虑了适当计划的ATC航路（考虑天气、NOTAM、ATS程序/限制/延误和MEL/CDL限制），在最佳高度和速度计划下，考虑了风、温度和飞机质量。航程燃油不包括滑行燃油（进出）、备降燃油、等待燃油、应急燃油、储备燃油、额外燃油和/或油罐燃油。\n起飞备降燃油–当起飞机场的天气条件低于适用的机场运行着陆最低标准或存在其他妨碍返回起飞机场的运行条件时，起飞后备降至指定的起飞备降机场并着陆所需的燃油。\n航路备降燃油–飞机在航路中遇到异常或紧急情况后，备降至指定的航路备降机场并着陆所需的燃油。\nEDTO (ETOPS)航路备降燃油–在EDTO (ETOPS)运行中，飞机在航路中遇到发动机停车或其他异常或紧急情况后，备降至指定的ETOPS航路备降机场并着陆所需的燃油。\n目的地备降燃油–在目的地进行一次复飞，并通过适当的ATC航路备降至指定的备降机场，在当局指定的高度和燃油消耗条件下着陆所需的燃油。\n等待燃油–为预期的和/或可能的空中交通、天气、低能见度/仪表着陆条件或其他飞行中延误所需的燃油。\n应急燃油–除航程燃油外，为补偿可能影响到目的地机场燃油消耗的不可预见因素所需的燃油；这些因素包括未预报的航路风、温度、天气变化、偏离计划的飞行航路、巡航高度和延长的滑行时间。\n储备燃油–除航程燃油外，非计划用于正常使用的所需燃油，但在所有其他可用燃油（除航程、应急、等待和备降燃油外）已消耗完毕的情况下，可用于不可预见的事件。该燃油仅在没有其他更安全的选择时使用，并通常由当局定义。\n最后储备燃油–当不需要目的地备降机场时，使用到达目的地备降机场或目的地机场的预计飞机质量计算的燃油量：\n• 对于往复式发动机飞机，按运营人所在国规定的速度和高度条件飞行45分钟所需的燃油量；或\n• 对于涡轮发动机飞机，在机场上方1500英尺高度，标准条件下或按国家规定的速度和高度条件飞行30分钟所需的燃油量。\n额外燃油–仅当航程燃油、目的地备降燃油、应急燃油和最后储备燃油的总和不足以使飞机遵守国家定义的最关键燃油情景时所需的补充燃油量。\n酌情燃油–由机长酌情携带的额外燃油。\n油罐燃油–为经济原因或运营人方便而运输的燃油（例如由于价格/可用性）。\n不可用燃油–为运营目的运输的燃油，例如为满足MEL要求或作为压舱物以保持重量和平衡而携带的燃油。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0g1h2i3-j4k5-4l6m-7n8o-p9q0r1s2t3u4f0",
    chinese_name: "加油安全区",
    english_name: "Fueling Safety Zone",
    definition: "在飞机加油操作期间，在停机坪上围绕飞机加油接口、油箱通风口和加油设备建立的具有相关限制的区域。",
    equivalent_terms: "Refueling Safety Zone",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "01h2i3j4-k5l6-4m7n-8o9p-q0r1s2t3u4v5g1",
    chinese_name: "舷梯",
    english_name: "Gangway",
    definition: "用于乘客上下水上飞机与平台或码头之间的可移动走道。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "12i3j4k5-l6m7-4n8o-9p0q-r1s2t3u4v5w6h2",
    chinese_name: "登机口交付物品",
    english_name: "Gate Delivery Item",
    definition: "在登机口从乘客处收回的行李，由于尺寸/重量/空间原因，无法作为DAA处理，并在到达时与其他托运行李一同在行李传送带上交付。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "23j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7i3",
    chinese_name: "通用维修手册 (GMM)",
    english_name: "General Maintenance Manual (GMM)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM))。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM)",
    see_also_array: ["Maintenance Management Manual (MMM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "34k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8j4",
    chinese_name: "通用运行手册 (GOM)",
    english_name: "General Operations Manual (GOM)",
    definition: "运营手册(OM)的一个独立手册或通用部分，包含与特定飞机类型无关的飞行机组政策和程序，适用于以下运营人员：\n• 飞行机组；\n• 客舱机组；\n• 飞行运行官员/飞行签派员；\n• 由运营人确定或国家要求的其他运营人员。\n参见：运行手册(Operations Manual)。",
    equivalent_terms: "Flight Operations Manual (FOM), Cabin Operations Manual (COM), General Maintenance Manual (GMM)",
    see_also: "Operations Manual",
    see_also_array: ["Operations Manual"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "45l6m7n8-o9p0-4q1r-2s3t-u4v5w6x7y8z9k5",
    chinese_name: "通用程序手册 (GPM)",
    english_name: "General Procedures Manual (GPM)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM))。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM)",
    see_also_array: ["Maintenance Management Manual (MMM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "56m7n8o9-p0q1-4r2s-3t4u-v5w6x7y8z9a0l6",
    chinese_name: "全球航空数据管理",
    english_name: "Global Aviation Data Management",
    definition: "全球航空数据管理(GADM)是一个航空安全解决方案，将来自各种渠道（如飞行运行、基础设施、审计）的数据源整合到一个单一的数据库结构中。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "67n8o9p0-q1r2-4s3t-4u5v-w6x7y8z9a0b1m7",
    chinese_name: "GOAR质量控制",
    english_name: "GOAR Quality Control",
    definition: "由IATA和主任审计员实施的流程，以确保构成ISAGO审计报告(GOAR)的所有文件都按照IATA发布的指导和程序准确完成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "78o9p0q1-r2s3-4t4u-5v6w-x7y8z9a0b1c2n8",
    chinese_name: "GOSARPs",
    english_name: "GOSARPs",
    definition: "ISAGO标准和建议做法的缩写和首字母缩写词。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "89p0q1r2-s3t4-4u5v-6w7x-y8z9a0b1c2d3o9",
    chinese_name: "地面损伤数据库 (GDDB)",
    english_name: "Ground Damage Database (GDDB)",
    definition: "参见：IATA地面损伤数据库(IATA Ground Damage Database (GDDB))。",
    equivalent_terms: "",
    see_also: "IATA Ground Damage Database (GDDB)",
    see_also_array: ["IATA Ground Damage Database (GDDB)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "90q1r2s3-t4u5-4v6w-7x8y-z9a0b1c2d3e4p0",
    chinese_name: "地面保障",
    english_name: "Ground Handling",
    definition: "在机场为飞机到达和离港所必需的地面服务，不包括空中交通服务。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1r2s3t4-u5v6-4w7x-8y9z-a0b1c2d3e4f5q1",
    chinese_name: "地面保障协议",
    english_name: "Ground Handling Agreement",
    definition: "客户组织与地面保障服务提供商之间的合同，规定了提供商为客户提供地面保障服务相关的所有条件和要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2s3t4u5-v6w7-4x8y-9z0a-b1c2d3e4f5g6r2",
    chinese_name: "地面保障运行手册",
    english_name: "Ground Handling Operations Manual",
    definition: "参见：运行手册(Operations Manual (OM))。",
    equivalent_terms: "",
    see_also: "Operations Manual (OM)",
    see_also_array: ["Operations Manual (OM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3t4u5v6-w7x8-4y9z-0a1b-c2d3e4f5g6h7s3",
    chinese_name: "地面运行",
    english_name: "Ground Operations",
    definition: "与构成地面保障的地面服务相关的活动。\n参见：地面保障(Ground Handling)。",
    equivalent_terms: "",
    see_also: "Ground Handling",
    see_also_array: ["Ground Handling"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4u5v6w7-x8y9-4z0a-1b2c-d3e4f5g6h7i8t4",
    chinese_name: "近地警告系统 (GPWS)",
    english_name: "Ground Proximity Warning System (GPWS)",
    definition: "一种飞机系统，当飞机与地球表面处于潜在危险的近距离时，自动向飞行机组提供及时和独特的警告。\nGPWS具有以下五种基本模式，当飞机与地球表面近距离时，自动向飞行机组发出警告：\n• 过大的下降率；\n• 过大的地形接近率；\n• 起飞或复飞后过大的高度损失；\n• 在非着陆构型下不安全的地形清除；和/或\n• 过度低于仪表下滑道。\n具有前视地形规避(FLTA)功能的近地警告系统(GPWS)\n一种GPWS，提供前视能力和地形清除基准，并自动向飞行机组提供必要的警报时间，以防止与地球表面潜在危险的近距离和可控飞行撞地(CFIT)事件。",
    equivalent_terms: "Terrain Awareness and Warning System (TAWS), Enhanced Ground Proximity Warning System (EGPWS)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5v6w7x8-y9z0-4a1b-2c3d-e4f5g6h7i8j9u5",
    chinese_name: "地面服务提供商 (GSP)",
    english_name: "Ground Services Provider (GSP)",
    definition: "作为一家或多家客户航空公司的处理代理，提供SGHA中定义的一项或多项地面服务的提供商。\n参见：提供商(Provider)。",
    equivalent_terms: "",
    see_also: "Provider",
    see_also_array: ["Provider"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6w7x8y9-z0a1-4b2c-3d4e-f5g6h7i8j9k0v6",
    chinese_name: "地面保障设备 (GSE)",
    english_name: "Ground Support Equipment (GSE)",
    definition: "在停机坪上用于飞机服务和地面保障的车辆或设备。",
    equivalent_terms: "Aircraft Ground Support Equipment (AGSE)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7x8y9z0-a1b2-4c3d-4e5f-g6h7i8j9k0l1w7",
    chinese_name: "集团公司",
    english_name: "Group Company",
    definition: "运营人或AO的任何子公司或控股公司，或任何此类控股公司的任何子公司。为IOSA之目的，控股公司应包括运营人或AO所属集团的控股公司，子公司应包括运营人、AO或此类控股公司拥有直接或间接控制权的任何公司。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8y9z0a1-b2c3-4d4e-5f6g-h7i8j9k0l1m2x8",
    chinese_name: "GSP公告",
    english_name: "GSP Bulletin",
    definition: "一份编号文件，用于向地面服务提供商传达ISAGO计划事宜以供参考。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9z0a1b2-c3d4-4e5f-6g7h-i8j9k0l1m2n3y9",
    chinese_name: "指导材料",
    english_name: "Guidance Material",
    definition: "用于澄清某些ISARPs/GOSARPs的含义和意图的信息；指导材料也可能指定实现符合性的示例或可接受的方式。IOSA/ISSA/ISAGO条款后跟的(GM)符号表示存在与该条款相关的指导材料。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },  
  {
    id: "j0a1b2c3-d4e5-4f6g-7h8i-j9k0l1m2n3o4j0",
    chinese_name: "危险源",
    english_name: "Hazard",
    definition: "可能导致或促成飞机事件或事故的状况、行为、情况或物体。\n参见：运营职能(Operational Function)。",
    equivalent_terms: "",
    see_also: "Operational Function",
    see_also_array: ["Operational Function"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5k1",
    chinese_name: "危险源识别",
    english_name: "Hazard Identification",
    definition: "识别飞机运行危险源的结构化过程。危险源识别包括三种方法：\n• 反应性–分析过去的结果或事件的数据。\n• 主动性–分析现有或实时情况的数据。\n• 预测性–分析可能识别未来危险源的数据。\n参见：危险源（飞机运行）(Hazard (Aircraft Operations))。",
    equivalent_terms: "",
    see_also: "Hazard (Aircraft Operations)",
    see_also_array: ["Hazard (Aircraft Operations)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2c3d4e5-f6g7-4h8i-9j0k-l1m2n3o4p5q6l2",
    chinese_name: "总部审计",
    english_name: "Headquarters Audit",
    definition: "在ISAGO下进行的审计，评估地面服务提供商（GSP）在所有站点提供ISAGO范围内的地面运营的企业管理政策、流程和程序的适用GOSARP符合性。",
    equivalent_terms: "Corporate Audit",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3d4e5f6-g7h8-4i9j-0k1l-m2n3o4p5q6r7m3",
    chinese_name: "平视显示器 (HUD)",
    english_name: "Head-up Display (HUD)",
    definition: "一种显示系统，将各种飞行信息呈现在飞行员的前方外部视野中，而不会显著限制外部视野。",
    equivalent_terms: "Head-up Guidance System (HGS)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4e5f6g7-h8i9-4j0k-1l2m-n3o4p5q6r7s8n4",
    chinese_name: "大修",
    english_name: "Heavy Maintenance",
    definition: "参见：基地维修(Base Maintenance)。",
    equivalent_terms: "",
    see_also: "Base Maintenance",
    see_also_array: ["Base Maintenance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5f6g7h8-i9j0-4k1l-2m3n-o4p5q6r7s8t9o5",
    chinese_name: "高风险货物",
    english_name: "High-risk Cargo",
    definition: "根据特定情报被认为对民航构成威胁的货物或邮件；或显示异常或有篡改迹象引起怀疑的货物或邮件。\n参见：货舱(Cargo Compartment)。",
    equivalent_terms: "",
    see_also: "Cargo Compartment",
    see_also_array: ["Cargo Compartment"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6g7h8i9-j0k1-4l2m-3n4o-p5q6r7s8t9u0p6",
    chinese_name: "货舱",
    english_name: "Hold",
    definition: "参见：货舱(Cargo Compartment)。",
    equivalent_terms: "",
    see_also: "Cargo Compartment",
    see_also_array: ["Cargo Compartment"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7h8i9j0-k1l2-4m3n-4o5p-q6r7s8t9u0v1q7",
    chinese_name: "货舱行李",
    english_name: "Hold Baggage",
    definition: "参见：托运行李(Checked Baggage)。",
    equivalent_terms: "",
    see_also: "Checked Baggage",
    see_also_array: ["Checked Baggage"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8i9j0k1-l2m3-4n4o-5p6q-r7s8t9u0v1w2r8",
    chinese_name: "保留项目",
    english_name: "Hold Item",
    definition: "对飞行安全没有影响，但存在缺陷且其维修目前“待定”等待整改的项目。",
    equivalent_terms: "Hold Item List",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9j0k1l2-m3n4-4o5p-6q7r-s8t9u0v1w2x3s9",
    chinese_name: "保持时间",
    english_name: "Holdover Time",
    definition: "在结冰条件下，防冰液能在飞机受保护表面防止霜或冰形成以及雪积聚的预计时间。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0k1l2m3-n4o5-4p6q-7r8s-t9u0v1w2x3y4t0",
    chinese_name: "房屋与设施",
    english_name: "Housing and Facilities",
    definition: "构成运营人或AMO的那些建筑物、办公室、机库和车间。",
    equivalent_terms: "Place of Business, Maintenance Base, Maintenance Facility(ies)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1l2m3n4-o5p6-4q7r-8s9t-u0v1w2x3y4z5u1",
    chinese_name: "内务管理",
    english_name: "Housekeeping",
    definition: "工作区域的一般照管和管理，包括为使系统正常运行而必须完成的那些日常任务（例如清洁、整洁）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2m3n4o5-p6q7-4r8s-9t0u-v1w2x3y4z5a6v2",
    chinese_name: "人为因素原则",
    english_name: "Human Factors Principles",
    definition: "应用于航空设计、认证、培训、运营和维修的原则，以确保设备、系统、流程和程序考虑到人的能力和局限性，以及人与系统组件之间的安全接口，旨在优化人的表现并减少人为差错。\n参见：机组资源管理(Crew Resource Management), 人的表现(Human Performance)。",
    equivalent_terms: "",
    see_also: "Crew Resource Management, Human Performance",
    see_also_array: ["Crew Resource Management", "Human Performance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3n4o5p6-q7r8-4s9t-0u1v-w2x3y4z5a6b7w3",
    chinese_name: "人的表现",
    english_name: "Human Performance",
    definition: "对航空运营的安全和效率产生影响的人的能力和局限性。\n参见：机组资源管理(Crew Resource Management), 人为因素原则(Human Factors Principles)。",
    equivalent_terms: "",
    see_also: "Crew Resource Management, Human Factors Principles",
    see_also_array: ["Crew Resource Management", "Human Factors Principles"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4o5p6q7-r8s9-4t0u-1v2w-x3y4z5a6b7c8x4",
    chinese_name: "人道屠宰工具",
    english_name: "Humane Killer",
    definition: "用于人道毁灭大型动物（例如牲畜）的工具。",
    equivalent_terms: "Free-bullet Pistol",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5p6q7r8-s9t0-4u1v-2w3x-y4z5a6b7c8d9y5",
    chinese_name: "缺氧",
    english_name: "Hypoxia",
    definition: "吸入气体、动脉血或组织中氧气不足，但未达到缺氧症（几乎完全缺氧）的程度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6q7r8s9-t0u1-4v2w-3x4y-z5a6b7c8d9e0z6",
    chinese_name: "混合审计",
    english_name: "Hybrid Audit",
    definition: "结合现场审计和远程审计活动进行的审计。\n注：混合审计需要IATA的特别批准，因为它处理了妨碍审计员亲临现场的情况。\n参见：IPM(IPM)。",
    equivalent_terms: "",
    see_also: "IPM",
    see_also_array: ["IPM"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7r8s9t0-u1v2-4w3x-4y5z-a6b7c8d9e0f1a7",
    chinese_name: "IAR质量控制",
    english_name: "IAR Quality Control",
    definition: "由IATA和审计组织(AO)实施的流程，以确保构成IOSA审计报告(IAR)的所有文件都按照IATA发布的指导和程序准确完成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8s9t0u1-v2w3-4x4y-5z6a-b7c8d9e0f1g2b8",
    chinese_name: "IAT教员",
    english_name: "IAT Instructor",
    definition: "有资格并被批准教授IOSA审计员培训(IAT)课程的教员。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9t0u1v2-w3x4-4y5z-6a7b-c8d9e0f1g2h3c9",
    chinese_name: "IATA",
    english_name: "IATA",
    definition: "国际航空运输协会的缩写和首字母缩写词。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0u1v2w3-x4y5-4z6a-7b8c-d9e0f1g2h3i4d0",
    chinese_name: "IATA事故数据交换 (ADX)",
    english_name: "IATA Accident Data Exchange (ADX)",
    definition: "一个数据库系统，为航空安全专业人员和研究人员提供商业航空事故及其成因的存储库。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1v2w3x4-y5z6-4a7b-8c9d-e0f1g2h3i4j5e1",
    chinese_name: "IATA货物操作手册 (ICHM)",
    english_name: "IATA Cargo Handling Manual (ICHM)",
    definition: "一份IATA手册，包含安全高效处理货物的最新程序和建议做法。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2w3x4y5-z6a7-4b8c-9d0e-f1g2h3i4j5k6f2",
    chinese_name: "IATA地面运行手册 (IGOM)",
    english_name: "IATA Ground Operations Manual (IGOM)",
    definition: "一份由IATA制作的手册，是协调一线人员地面处理流程和程序的最新行业批准标准的来源。\n参见：机场地面服务手册(Airport Handling Manual (AHM))。",
    equivalent_terms: "",
    see_also: "Airport Handling Manual (AHM)",
    see_also_array: ["Airport Handling Manual (AHM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3x4y5z6-a7b8-4c9d-0e1f-g2h3i4j5k6l7g3",
    chinese_name: "IATA事件数据交换 (IDX)",
    english_name: "IATA Incident Data Exchange (IDX)",
    definition: "一个全球性的、聚合的、去识别化的事件报告数据库，包括飞行、客舱和地面运行安全与安保事件；为参与者提供一个安全的环境来查看和基准聚合的事件数据。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4y5z6a7-b8c9-4d0e-1f2g-h3i4j5k6l7m8h4",
    chinese_name: "IATA安全、飞行和地面运行咨询委员会 (SFGOAC)",
    english_name: "IATA Safety, Flight and Ground Operations Advisory Council (SFGOAC)",
    definition: "IATA治理结构内的机构，就涉及国际航空运输中安全、飞行运行和地面运行的事项向理事会(BoG)以及总干事和首席执行官提供建议。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5z6a7b8-c9d0-4e1f-2g3h-i4j5k6l7m8n9i5",
    chinese_name: "IATA世界航空运输统计 (WATS)",
    english_name: "IATA World Air Transport Statistics (WATS)",
    definition: "航空运输业最全面、最新的参考摘要，提供对广泛的关键行业问题的广泛覆盖。它是汇集了200多家航空公司数据的全面年度统计图景。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6a7b8c9-d0e1-4f2g-3h4i-j5k6l7m8n9o0j6",
    chinese_name: "ICAO附件",
    english_name: "ICAO Annexes",
    definition: "《国际民用航空公约》(ICAO)的附件，为缔约国的国家航空当局制定管辖商业飞行的民航规则和法规提供指导。\n参见：缔约国(Contracting State)。",
    equivalent_terms: "",
    see_also: "Contracting State",
    see_also_array: ["Contracting State"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7b8c9d0-e1f2-4g3h-4i5j-k6l7m8n9o0p1k7",
    chinese_name: "IEnvA评估",
    english_name: "IEnvA Assessment",
    definition: "一个收集证据的过程，以评估评估标准（IESM标准）的满足情况。IEnvA评估必须是客观、公正和独立的，并且评估过程必须是系统化和文件化的。评估可以是内部的或外部的。评估证据包括记录、事实陈述和其他可验证的信息，这些信息与正在使用的评估标准相关。评估标准可被视为一个参考点，包括政策、要求和其他形式的文件化信息。它们与评估证据进行比较，以确定它们的满足情况。评估证据用于确定政策的实施情况和要求的遵守情况。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8c9d0e1-f2g3-4h4i-5j6k-l7m8n9o0p1q2l8",
    chinese_name: "IEnvA背景",
    english_name: "IEnvA Context",
    definition: "由其范围定义的运营人业务环境。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9d0e1f2-g3h4-4i5j-6k7l-m8n9o0p1q2r3m9",
    chinese_name: "图解零件目录 (IPC)",
    english_name: "Illustrated Parts Catalogue (IPC)",
    definition: "由飞机、发动机或部件制造商制作的零件清单。",
    equivalent_terms: "Illustrated Parts List (IPL)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0e1f2g3-h4i5-4j6k-7l8m-n9o0p1q2r3s4n0",
    chinese_name: "图解零件清单 (IPL)",
    english_name: "Illustrated Parts List (IPL)",
    definition: "参见：图解零件目录(Illustrated Parts Catalogue (IPC))。",
    equivalent_terms: "",
    see_also: "Illustrated Parts Catalogue (IPC)",
    see_also_array: ["Illustrated Parts Catalogue (IPC)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1f2g3h4-i5j6-4k7l-8m9n-o0p1q2r3s4t5o1",
    chinese_name: "实施行动计划 (IAP)",
    english_name: "Implementation Action Plan (IAP)",
    definition: "运营人或提供商为实现与指定的IOSA/ISSA或ISAGO标准或建议做法的完全技术符合性而制定的详细计划；描述了具有具体进展里程碑的时间表，并定义了完成该计划所需的所有活动、资源、设备和材料。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2g3h4i5-j6k7-4l8m-9n0o-p1q2r3s4t5u6p2",
    chinese_name: "已实施（运营）",
    english_name: "Implemented (Operations)",
    definition: "运营规范作为运营系统的一部分被建立、激活、集成、纳入、部署、安装、维护和/或可用的状态，并根据需要进行监控和评估，以确保实现期望的结果。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3h4i5j6-k7l8-4m9n-0o1p-q2r3s4t5u6v7q3",
    chinese_name: "不可接触货舱",
    english_name: "Inaccessible Cargo Hold",
    definition: "如果货舱通过锁定的门或物理屏障进行保护，从而防止其内容物受到未经授权的干扰，则该货舱被认为是不可接触的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4i5j6k7-l8m9-4n0o-1p2q-r3s4t5u6v7w8r4",
    chinese_name: "不活跃的批准运行",
    english_name: "Inactive Approved Operations",
    definition: "运营人选择不进行某些类型的其拥有监管批准的运行（例如危险品运输）的情况。在这种情况下，如果在一个受控文件（例如运营手册）中明确说明运营人不进行指定的运行，则解决此类不活跃运行的IOSA条款规范在审计期间将不适用于该运营人。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5j6k7l8-m9n0-4o1p-2q3r-s4t5u6v7w8x9s5",
    chinese_name: "不予入境旅客",
    english_name: "Inadmissible Passenger",
    definition: "被拒绝入境一国或被拒绝继续旅行的航空公司乘客（例如缺少签证或护照过期）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6k7l8m9-n0o1-4p2q-3r4s-t5u6v7w8x9y0t6",
    chinese_name: "行动不便的旅客",
    english_name: "Incapacitated Passenger",
    definition: "有残疾，无法以通常方式移动或行事的旅客。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7l8m9n0-o1p2-4q3r-4s5t-u6v7w8x9y0z1u7",
    chinese_name: "事件（航空器）",
    english_name: "Incident (Aircraft)",
    definition: "与飞机运行相关的，非飞机事故的事件，影响或可能影响运行安全。严重事件–涉及情况表明发生事故的可能性很高的事件，与飞机运行相关，在有人驾驶飞机的情况下，发生在任何人以飞行意图登上飞机到所有这些人下机之间的时间，或在无人驾驶飞机的情况下，发生在飞机准备好以飞行目的移动到飞行结束时停稳且主推进系统关闭之间的时间。",
    equivalent_terms: "Safety related event",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8m9n0o1-p2q3-4r4s-5t6u-v7w8x9y0z1a2v8",
    chinese_name: "公司内部培训",
    english_name: "In-company Training",
    definition: "由AO和ETO共同商定的时间和地点进行的IOSA审计员培训(IAT)课程的交付，以满足AO的审计员培训需求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9n0o1p2-q3r4-4s5t-6u7v-w8x9y0z1a2b3w9",
    chinese_name: "不相容（危险品）",
    english_name: "Incompatible (Dangerous Goods)",
    definition: "对危险品的描述，如果混合，可能会导致危险的热量或气体演化或产生腐蚀性物质。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0o1p2q3-r4s5-4t6u-7v8w-x9y0z1a2b3c4x0",
    chinese_name: "独立检查",
    english_name: "Independent Inspection",
    definition: "由非执行维修的人员在维修后对飞机系统进行的检查。通常涉及飞行控制的检查。",
    equivalent_terms: "Dual Inspection",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1p2q3r4-s5t6-4u7v-8w9x-y0z1a2b3c4d5y1",
    chinese_name: "独立质量保证体系",
    english_name: "Independent Quality Assurance System",
    definition: "参见：质量保证(Quality Assurance)。",
    equivalent_terms: "",
    see_also: "Quality Assurance",
    see_also_array: ["Quality Assurance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2q3r4s5-t6u7-4v8w-9x0y-z1a2b3c4d5e6z2",
    chinese_name: "婴儿",
    english_name: "Infant",
    definition: "为识别乘客目的，通常被定义为年龄小于两岁的儿童。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3r4s5t6-u7v8-4w9x-0y1z-a2b3c4d5e6f7a3",
    chinese_name: "飞行中",
    english_name: "In-flight",
    definition: "从飞机准备好为起飞目的移动的时刻开始，到飞行结束时最终停稳且发动机关闭的时刻结束的期间。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4s5t6u7-v8w9-4x0y-1z2a-b3c4d5e6f7g8b4",
    chinese_name: "飞行中重新计划点",
    english_name: "In-flight Re-planning Point",
    definition: "一个地理点，飞机可以在该点继续前往预定着陆机场（计划目的地）或改道至中间（备降）机场，如果航班到达该点时燃油不足以完成飞往计划目的地并保持所需燃油储备。",
    equivalent_terms: "Re-dispatch Point, Re-release Point.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5t6u7v8-w9x0-4y1z-2a3b-c4d5e6f7g8h9c5",
    chinese_name: "初次审计",
    english_name: "Initial Audit",
    definition: "为实现初次IOSA/ISSA或ISAGO注册而对运营人或提供商进行的审计（评估）。\n参见：审计（评估）(Audit (Assessment)), IOSA运营人(IOSA Operator), IOSA注册(IOSA Registration)。",
    equivalent_terms: "",
    see_also: "Audit (Assessment), IOSA Operator, IOSA Registration",
    see_also_array: ["Audit (Assessment)", "IOSA Operator", "IOSA Registration"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6u7v8w9-x0y1-4z2a-3b4c-d5e6f7g8h9i0d6",
    chinese_name: "机上装载系统",
    english_name: "In-plane Loading System",
    definition: "安装在飞机地板上的传送带系统，允许将集装单元(ULDs)装卸到飞机上；包含一个合适的约束系统以将ULDs固定在停放位置。\n参见：集装单元(Unit Load Device (ULD))。",
    equivalent_terms: "Cargo Loading System (CLS)",
    see_also: "Unit Load Device (ULD)",
    see_also_array: ["Unit Load Device (ULD)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7v8w9x0-y1z2-4a3b-4c5d-e6f7g8h9i0j1e7",
    chinese_name: "在役",
    english_name: "In-service",
    definition: "在ISM和GOSM中用于指定飞机在运行期间（即在役）的适用性的术语；例如，在役项目是在飞行中使用的项目，在役事件是在飞行中发生的事件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8w9x0y1-z2a3-4b4c-5d6e-f7g8h9i0j1k2f8",
    chinese_name: "检查",
    english_name: "Inspect",
    definition: "查看、仔细和批判性地观察、审视，以确定零件或单元的状况、准确性和效率，以确保设备除非处于最佳状态并符合批准的标准，否则不得使用。",
    equivalent_terms: "Inspection, Examination",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9x0y1z2-a3b4-4c5d-6e7f-g8h9i0j1k2l3g9",
    chinese_name: "检查",
    english_name: "Inspection",
    definition: "通过观察和判断进行的独立文件化符合性评估，酌情辅以测量、测试或测量，以验证是否符合适用要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0y1z2a3-b4c5-4d6e-7f8g-h9i0j1k2l3m4h0",
    chinese_name: "检查程序手册 (IPM)",
    english_name: "Inspection Procedures Manual (IPM)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM)) 和 维修程序手册(Maintenance Procedures Manual (MPM))。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM), Maintenance Procedures Manual (MPM)",
    see_also_array: ["Maintenance Management Manual (MMM)", "Maintenance Procedures Manual (MPM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1z2a3b4-c5d6-4e7f-8g9h-i0j1k2l3m4n5i1",
    chinese_name: "检查系统",
    english_name: "Inspection System",
    definition: "一个要求对飞机或飞机部件进行检查以确定其符合批准的标准的系统。",
    equivalent_terms: "Quality Control, QC",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2a3b4c5-d6e7-4f8g-9h0i-j1k2l3m4n5o6j2",
    chinese_name: "教员",
    english_name: "Instructor",
    definition: "通过示范、指导、辅导、培训、演练和/或练习传授知识或教授实践技能的人员。教员可以利用测试、检查、评估或评价活动作为确定熟练度或能力的方式。",
    equivalent_terms: "Trainer, Teacher",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3b4c5d6-e7f8-4g9h-0i1j-k2l3m4n5o6p7k3",
    chinese_name: "仪表飞行规则 (IFR)",
    english_name: "Instrument Flight Rules (IFR)",
    definition: "在外部目视参考不安全的情况下管辖飞行的规则和法规。IFR飞行依赖于参考驾驶舱内的仪表飞行，导航通过参考电子信号完成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4c5d6e7-f8g9-4h0i-1j2k-l3m4n5o6p7q8l4",
    chinese_name: "仪表气象条件 (IMC)",
    english_name: "Instrument Meteorological Conditions (IMC)",
    definition: "要求飞机主要依靠仪表飞行的气象条件；以能见度、距云距离和云高表示；低于目视气象条件下运行的最低标准。\n参见：目视气象条件(Visual Meteorological Conditions (VMC))。",
    equivalent_terms: "",
    see_also: "Visual Meteorological Conditions (VMC)",
    see_also_array: ["Visual Meteorological Conditions (VMC)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5d6e7f8-g9h0-4i1j-2k3l-m4n5o6p7q8r9m5",
    chinese_name: "整体式客梯",
    english_name: "Integral Airstairs",
    definition: "包含在飞机机身内或内置于飞机机身的楼梯，可在地面上展开，为人员提供进出飞机的途径。",
    equivalent_terms: "Integral Stairway",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6e7f8g9-h0i1-4j2k-3l4m-n5o6p7q8r9s0n6",
    chinese_name: "飞机互换",
    english_name: "Interchange of Aircraft",
    definition: "在不同运营人之间交换或互换飞机的系统，时间非常短，以实现飞机的最大利用率和更高效率。每个运营人的责任都经过仔细定义，以确保运营安全并遵守法规和立法。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7f8g9h0-i1j2-4k3l-4m5n-o6p7q8r9s0t1o7",
    chinese_name: "利益相关方",
    english_name: "Interested Party",
    definition: "任何能够影响、被影响或认为自己受到决策或活动影响的个人、团体或组织。在此背景下，任何能够影响或被运营人的环境绩效影响的个人、团体或组织。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8g9h0i1-j2k3-4l4m-5n6o-p7q8r9s0t1u2p8",
    chinese_name: "临时纠正措施",
    english_name: "Interim Corrective Action",
    definition: "在临时基础上提供对不符合项的满意解决方案的行动，直到运营人能够完全实施已接受的CAP中的永久纠正措施；仅当运营人正在为现有注册的续期进行审计且已从IATA请求并获得批准时才可接受。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9h0i1j2-k3l4-4m5n-6o7p-q8r9s0t1u2v3q9",
    chinese_name: "内部审计",
    english_name: "Internal Audit",
    definition: "由组织对其自身职能或活动进行的审计；由该组织的员工或代表该组织（外包）的非员工执行。\n参见：审计(Audit)。",
    equivalent_terms: "Internal Evaluation",
    see_also: "Audit",
    see_also_array: ["Audit"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0i1j2k3-l4m5-4n6o-7p8q-r9s0t1u2v3w4r0",
    chinese_name: "内部审计员",
    english_name: "Internal Auditor",
    definition: "进行内部审计的审计员。\n参见：审计员(Auditor), 内部审计(Internal Audit)。",
    equivalent_terms: "",
    see_also: "Auditor, Internal Audit",
    see_also_array: ["Auditor", "Internal Audit"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1j2k3l4-m5n6-4o7p-8q9r-s0t1u2v3w4x5s1",
    chinese_name: "国际英语",
    english_name: "International English",
    definition: "IATA用于描述IATA出版物中所用英语的术语；指国际上最广泛传播且在互联网上最常用的英语形式；单词拼写主要遵循美式英语。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2k3l4m5-n6o7-4p8q-9r0s-t1u2v3w4x5y6t2",
    chinese_name: "国际航班",
    english_name: "International Flights",
    definition: "从一国领土内的机场飞往另一国领土内的机场的航班。",
    equivalent_terms: "International Operations",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3l4m5n6-o7p8-4q9r-0s1t-u2v3w4x5y6z7u3",
    chinese_name: "IOSA",
    english_name: "IOSA",
    definition: "IATA运行安全审计的缩写和首字母缩写词。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4m5n6o7-p8q9-4r0s-1t2u-v3w4x5y6z7a8v4",
    chinese_name: "IOSA认证",
    english_name: "IOSA Accreditation",
    definition: "IATA对一个组织根据适用的法律协议和IOSA计划手册(IPM)执行指定职能或服务的正式和官方认可与批准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5n6o7p8-q9r0-4s1t-2u3v-w4x5y6z7a8b9w5",
    chinese_name: "IOSA认证协议",
    english_name: "IOSA Accreditation Agreement",
    definition: "IATA与AO之间的协议，规定了适用于AO认证的规定和条件。\n注：也称为认证协议。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6o7p8q9-r0s1-4t2u-3v4w-x5y6z7a8b9c0x6",
    chinese_name: "IOSA认证委员会",
    english_name: "IOSA Accreditation Committee",
    definition: "IATA内由相关领域经理组成的小组，审查认证过程并对候选审计组织(AO)或认可培训机构(ETO)的认证提供正式批准（或不批准）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7p8q9r0-s1t2-4u3v-4w5x-y6z7a8b9c0d1y7",
    chinese_name: "IOSA审计协议",
    english_name: "IOSA Audit Agreement",
    definition: "IATA、AO和运营人（称为“受审方”）之间的协议，规定了与审计相关的商业安排以及所有其他条款、条件和限制。\n注：也称为审计协议。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8q9r0s1-t2u3-4v4w-5x6y-z7a8b9c0d1e2z8",
    chinese_name: "IOSA审计漏斗",
    english_name: "IOSA Audit Funnel",
    definition: "参见：审计漏斗(Audit Funnel)。",
    equivalent_terms: "",
    see_also: "Audit Funnel",
    see_also_array: ["Audit Funnel"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9r0s1t2-u3v4-4w5x-6y7z-a8b9c0d1e2f3a9",
    chinese_name: "IOSA审计手册 (AH)",
    english_name: "IOSA Audit Handbook (AH)",
    definition: "包含与AO、审计员以及IOSA下审计过程相关的信息、指导和说明的已发布文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0s1t2u3-v4w5-4x6y-7z8a-b9c0d1e2f3g4b0",
    chinese_name: "IOSA审计报告 (IAR)",
    english_name: "IOSA Audit Report (IAR)",
    definition: "审计的官方记录文件，其中包含有关审计执行和结果的详细信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1t2u3v4-w5x6-4y7z-8a9b-c0d1e2f3g4h5c1",
    chinese_name: "IOSA审计员",
    english_name: "IOSA Auditor",
    definition: "已满足IOSA资格和能力标准，并被正式批准在至少一个运营学科中进行审计的个人。\n注：术语IOSA审计员在IOSA计划中是通用的，可以指审计员、主任审计员或评估员。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2u3v4w5-x6y7-4z8a-9b0c-d1e2f3g4h5i6d2",
    chinese_name: "IOSA审计员个人数据文件",
    english_name: "IOSA Auditor Personal Data File",
    definition: "参见：审计员个人数据文件(Auditor Personal Data File)。",
    equivalent_terms: "",
    see_also: "Auditor Personal Data File",
    see_also_array: ["Auditor Personal Data File"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3v4w5x6-y7z8-4a9b-0c1d-e2f3g4h5i6j7e3",
    chinese_name: "IOSA审计员培训 (IAT)",
    english_name: "IOSA Auditor Training (IAT)",
    definition: "审计员资格认证过程的一个要素，旨在让经验丰富的航空运营审计员熟悉IOSA标准、方法和文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4w5x6y7-z8a9-4b0c-1d2e-f3g4h5i6j7k8f4",
    chinese_name: "IOSA检查单",
    english_name: "IOSA Checklist",
    definition: "IOSA审计员用于记录审计结论和支持发现项和观察项的事实证据的工作文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5x6y7z8-a9b0-4c1d-2e3f-g4h5i6j7k8l9g5",
    chinese_name: "IOSA数据库",
    english_name: "IOSA Database",
    definition: "管理IOSA审计报告(IARs)的官方IATA系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6y7z8a9-b0c1-4d2e-3f4g-h5i6j7k8l9m0h6",
    chinese_name: "IOSA运营人",
    english_name: "IOSA Operator",
    definition: "在IOSA注册名录上列出的运营人。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7z8a9b0-c1d2-4e3f-4g5h-i6j7k8l9m0n1i7",
    chinese_name: "IOSA监督委员会 (IOC)",
    english_name: "IOSA Oversight Council (IOC)",
    definition: "IATA治理结构内的机构，确保IATA成员对整个IOSA计划进行充分的监督和影响。IOC成员由IATA安全、飞行和运营高级副总裁(SFO)和IATA运营委员会(OPC)批准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8a9b0c1-d2e3-4f4g-5h6i-j7k8l9m0n1o2j8",
    chinese_name: "IOSA准备访问 (IPV)",
    english_name: "IOSA Preparation Visit (IPV)",
    definition: "在审计现场阶段之前完成的一项活动，允许AO为运营人制定审计准备计划提供直接指导。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9b0c1d2-e3f4-4g5h-6i7j-k8l9m0n1o2p3k9",
    chinese_name: "IOSA计划",
    english_name: "IOSA Program",
    definition: "IOSA系统的所有方面的总和。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0c1d2e3-f4g5-4h6i-7j8k-l9m0n1o2p3q4l0",
    chinese_name: "IOSA计划手册 (IPM)",
    english_name: "IOSA Program Manual (IPM)",
    definition: "包含IOSA计划所依据的标准的已发布文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1d2e3f4-g5h6-4i7j-8k9l-m0n1o2p3q4r5m1",
    chinese_name: "IOSA建议做法",
    english_name: "IOSA Recommended Practice",
    definition: "参见：建议做法(Recommended Practice)。",
    equivalent_terms: "",
    see_also: "Recommended Practice",
    see_also_array: ["Recommended Practice"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2e3f4g5-h6i7-4j8k-9l0m-n1o2p3q4r5s6n2",
    chinese_name: "IOSA注册",
    english_name: "IOSA Registration",
    definition: "IATA用于认可运营人符合IOSA标准，并将该运营人在指定的注册期内列入IOSA注册名录的正式方法。\n参见：IOSA注册期(IOSA Registration Period)。",
    equivalent_terms: "",
    see_also: "IOSA Registration Period",
    see_also_array: ["IOSA Registration Period"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3f4g5h6-i7j8-4k9l-0m1n-o2p3q4r5s6t7o3",
    chinese_name: "IOSA注册期",
    english_name: "IOSA Registration Period",
    definition: "通常为24个月的指定时间段，从IOSA运营人的IOSA注册（初次或续期）开始日期到该注册到期日期（到期日）之间。\n参见：IOSA运营人(IOSA Operator), IOSA注册(IOSA Registration)。",
    equivalent_terms: "",
    see_also: "IOSA Operator, IOSA Registration",
    see_also_array: ["IOSA Operator", "IOSA Registration"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4g5h6i7-j8k9-4l0m-1n2o-p3q4r5s6t7u8p4",
    chinese_name: "IOSA注册名录",
    english_name: "IOSA Registry",
    definition: "已接受审计并证明符合IOSA标准的运营人的官方列表。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5h6i7j8-k9l0-4m1n-2o3p-q4r5s6t7u8v9q5",
    chinese_name: "IOSA标准",
    english_name: "IOSA Standard",
    definition: "参见：标准(Standard)。",
    equivalent_terms: "",
    see_also: "Standard",
    see_also_array: ["Standard"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6i7j8k9-l0m1-4n2o-3p4q-r5s6t7u8v9w0r6",
    chinese_name: "IOSA标准手册 (ISM)",
    english_name: "IOSA Standards Manual (ISM)",
    definition: "包含ISARPs、指导材料和其他支持信息的已发布文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7j8k9l0-m1n2-4o3p-4q5r-s6t7u8v9w0x1s7",
    chinese_name: "IOSA系统",
    english_name: "IOSA System",
    definition: "根据IOSA计划手册(IPM)中发布的标准共同工作的IOSA计划的所有元素。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8k9l0m1-n2o3-4p4q-5r6s-t7u8v9w0x1y2t8",
    chinese_name: "IOSA培训协议",
    english_name: "IOSA Training Agreement",
    definition: "IATA与ETO之间的协议，规定了适用于ETO认证的规定和条件。\n参见：认可培训机构(Endorsed Training Organization (ETO))。",
    equivalent_terms: "",
    see_also: "Endorsed Training Organization (ETO)",
    see_also_array: ["Endorsed Training Organization (ETO)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9l0m1n2-o3p4-4q5r-6s7t-u8v9w0x1y2z3u9",
    chinese_name: "ISAGO",
    english_name: "ISAGO",
    definition: "IATA地面运行安全审计的缩写和首字母缩写词。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0m1n2o3-p4q5-4r6s-7t8u-v9w0x1y2z3a4v0",
    chinese_name: "ISAGO代理 (GOA)",
    english_name: "ISAGO Agent (GOA)",
    definition: "由IATA签约管理每年分配给其的ISAGO审计以完成ISAGO审计计划的代理。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1n2o3p4-q5r6-4s7t-8u9v-w0x1y2z3a4b5w1",
    chinese_name: "ISAGO审计协议",
    english_name: "ISAGO Audit Agreement",
    definition: "IATA与提供商（称为“受审方”）之间的协议，规定了与提供商的公司审计和站点审计相关的商业安排以及所有其他条款、条件和限制。\n注：也称为审计协议。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2o3p4q5-r6s7-4t8u-9v0w-x1y2z3a4b5c6x2",
    chinese_name: "ISAGO审计报告",
    english_name: "ISAGO Audit Report",
    definition: "审计的官方记录文件；包含有关审计执行和结果的详细信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3p4q5r6-s7t8-4u9v-0w1x-y2z3a4b5c6d7y3",
    chinese_name: "ISAGO审计报告质量控制",
    english_name: "ISAGO Audit Report Quality Control",
    definition: "由IATA和主任审计员实施的流程，以确保构成ISAGO审计报告的所有文件都按照IATA发布的指导和程序准确完成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4q5r6s7-t8u9-4v0w-1x2y-z3a4b5c6d7e8z4",
    chinese_name: "ISAGO审计员",
    english_name: "ISAGO Auditor",
    definition: "已满足ISAGO资格和能力标准，并被提名为进行审计的个人。\n参见：专业审计员宪章(Charter of Professional Auditors (CoPA))。\n注：术语ISAGO审计员在ISAGO内是通用的，可以指审计员或主任审计员。",
    equivalent_terms: "",
    see_also: "Charter of Professional Auditors (CoPA)",
    see_also_array: ["Charter of Professional Auditors (CoPA)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5r6s7t8-u9v0-4w1x-2y3z-a4b5c6d7e8f9a5",
    chinese_name: "ISAGO审计员培训课程 (GOAT)",
    english_name: "ISAGO Auditor Training Course (GOAT)",
    definition: "为候选审计员提供关于ISAGO流程和程序的培训，以及关于审计执行、审计技术和工具的信息的课程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6s7t8u9-v0w1-4x2y-3z4a-b5c6d7e8f9g0b6",
    chinese_name: "ISAGO检查单",
    english_name: "ISAGO Checklist",
    definition: "ISAGO审计员用于记录审计结论和支持发现项和观察项的事实证据的工作文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7t8u9v0-w1x2-4y3z-4a5b-c6d7e8f9g0h1c7",
    chinese_name: "ISAGO监督委员会 (GOC)",
    english_name: "ISAGO Oversight Council (GOC)",
    definition: "IATA治理结构内的机构，确保IATA成员对整个ISAGO计划进行充分的监督和影响。GOC成员由IATA安全、飞行和运营高级副总裁(SFO)和IATA安全、飞行和地面运行咨询委员会(SFGOAC)批准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8u9v0w1-x2y3-4z4a-5b6c-d7e8f9g0h1i2d8",
    chinese_name: "ISAGO计划",
    english_name: "ISAGO Program",
    definition: "ISAGO系统的所有方面的总和。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9v0w1x2-y3z4-4a5b-6c7d-e8f9g0h1i2j3e9",
    chinese_name: "ISAGO计划手册 (GOPM)",
    english_name: "ISAGO Program Manual (GOPM)",
    definition: "包含ISAGO计划所依据的标准的已发布文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0w1x2y3-z4a5-4b6c-7d8e-f9g0h1i2j3k4f0",
    chinese_name: "ISAGO建议做法",
    english_name: "ISAGO Recommended Practice",
    definition: "参见：建议做法(Recommended Practice)。",
    equivalent_terms: "",
    see_also: "Recommended Practice",
    see_also_array: ["Recommended Practice"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g1x2y3z4-a5b6-4c7d-8e9f-g0h1i2j3k4l5g1",
    chinese_name: "ISAGO注册",
    english_name: "ISAGO Registration",
    definition: "IATA用于认可提供商符合ISAGO标准，并将该提供商在指定的注册期内列入ISAGO注册名录的正式方法。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h2y3z4a5-b6c7-4d8e-9f0g-h1i2j3k4l5m6h2",
    chinese_name: "ISAGO注册名录",
    english_name: "ISAGO Registry",
    definition: "已接受审计并证明符合ISAGO标准的提供商的官方列表。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i3z4a5b6-c7d8-4e9f-0g1h-i2j3k4l5m6n7i3",
    chinese_name: "ISAGO标准",
    english_name: "ISAGO Standard",
    definition: "参见：标准(Standard)。",
    equivalent_terms: "",
    see_also: "Standard",
    see_also_array: ["Standard"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j4a5b6c7-d8e9-4f0g-1h2i-j3k4l5m6n7o8j4",
    chinese_name: "ISAGO标准手册 (GOSM)",
    english_name: "ISAGO Standards Manual (GOSM)",
    definition: "包含GOSARPs、指导材料和其他支持信息的已发布文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k5b6c7d8-e9f0-4g1h-2i3j-k4l5m6n7o8p9k5",
    chinese_name: "ISARPs",
    english_name: "ISARPs",
    definition: "IOSA标准和建议做法的缩写和首字母缩写词。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l6c7d8e9-f0g1-4h2i-3j4k-l5m6n7o8p9q0l6",
    chinese_name: "偏远机场",
    english_name: "Isolated Airport",
    definition: "对于给定的飞机类型，在规定的飞行时间内没有目的地备降机场的目的地机场。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m7d8e9f0-g1h2-4i3j-4k5l-m6n7o8p9q0r1m7",
    chinese_name: "工作单卡",
    english_name: "Job Card",
    definition: "参见：任务卡(Task Card)。",
    equivalent_terms: "Work Card",
    see_also: "Task Card",
    see_also_array: ["Task Card"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n8e9f0g1-h2i3-4j4k-5l6m-n7o8p9q0r1s2n8",
    chinese_name: "乘务员座椅",
    english_name: "Jump Seat",
    definition: "位于驾驶舱后部和/或客舱或货舱中，供机组成员、额外人员、货物随行人员、观察员或其他经批准的人员使用的座位。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o9f0g1h2-i3j4-4k5l-6m7n-o8p9q0r1s2t3o9",
    chinese_name: "乘务员座椅使用者",
    english_name: "Jump Seat Occupant",
    definition: "在飞机乘务员座椅上运输的人员。",
    equivalent_terms: "Jump Seat Rider, Jump Seat Observer, Jump-seater",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p0g1h2i3-j4k5-4l6m-7n8o-p9q0r1s2t3u4p0",
    chinese_name: "公正文化",
    english_name: "Just Culture",
    definition: "一种信任的环境，鼓励人们提供或报告重要信息，但同时也让人们清楚地知道可接受和不可接受行为之间的界限。公正文化包括：\n• 按照组织价值观和信念管理行为选择，以及\n• 平衡系统和个人责任。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q1h2i3j4-k5l6-4m7n-8o9p-q0r1s2t3u4v5q1",
    chinese_name: "已知货物",
    english_name: "Known Cargo",
    definition: "由受监管代理人、已知托运人或运营人直接从受监管代理人、运营人或已知托运人处接收的货物运输，已对其应用了适当的安全控制（可能包括安检），此后受到保护免受非法干扰，或\n经过适当的安全控制，使其“已知”并此后受到保护免受非法干扰的未知货物运输。\n参见：货物(Cargo), 安全货物(Secure Cargo), 受监管代理人(Regulated Agent)。",
    equivalent_terms: "",
    see_also: "Cargo, Secure Cargo, Regulated Agent",
    see_also_array: ["Cargo", "Secure Cargo", "Regulated Agent"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r2i3j4k5-l6m7-4n8o-9p0q-r1s2t3u4v5w6r2",
    chinese_name: "已知托运人",
    english_name: "Known Consignor",
    definition: "为通过空运运输而发货的发货人，已与受监管代理人或运营人建立了业务关系，并已证明满足特定安全运输货物的要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s3j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7s3",
    chinese_name: "着陆和等待指令运行 (LAHSO)",
    english_name: "Land and Hold Short Operations (LAHSO)",
    definition: "着陆飞机在着陆后被要求在跑道上的指定点前停止，以避免与另一架飞机、物体相撞，或避免跑道上的危险情况。",
    equivalent_terms: "Simultaneous Operations on Intersecting Runways (SOIR)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t4k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8t4",
    chinese_name: "大型飞机",
    english_name: "Large Aircraft",
    definition: "最大审定起飞重量超过5700公斤（12,566磅）的飞机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u5l6m7n8-o9p0-4q1r-2s3t-u4v5w6x7y8z9u5",
    chinese_name: "盥洗室",
    english_name: "Lavatory",
    definition: "安装在飞机上的一个隔间或小室，内有厕所和通常的洗漱设施，有结构墙和一扇门，关闭时形成一个完全封闭和隔离的内部空间，从隔间外看不见。",
    equivalent_terms: "Toilet",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v6m7n8o9-p0q1-4r2s-3t4u-v5w6x7y8z9a0v6",
    chinese_name: "主任审计员",
    english_name: "Lead Auditor",
    definition: "一位经验丰富的审计员，已获得必要的知识和技能，展示了能力，并已成功获得资格并被批准在IOSA/ISSA/ISAGO计划下领导一个审计组。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w7n8o9p0-q1r2-4s3t-4u5v-w6x7y8z9a0b1w7",
    chinese_name: "资料库",
    english_name: "Library",
    definition: "用于保存纸质或电子文件的有组织的系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x8o9p0q1-r2s3-4t4u-5v6w-x7y8z9a0b1c2x8",
    chinese_name: "执照颁发机构",
    english_name: "Licensing Authority",
    definition: "由国家指定负责人员执照颁发的机构。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y9p0q1r2-s3t4-4u5v-6w7x-y8z9a0b1c2d3y9",
    chinese_name: "生命周期",
    english_name: "Life Cycle",
    definition: "一个产品系统从原材料获取到寿命终结处置的连续和相互关联的阶段。一个产品系统的生命周期包括所有相关的活动、产品和服务，并可能包括采购的商品和服务以及寿命终结处理、退役和处置。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z0q1r2s3-t4u5-4v6w-7x8y-z9a0b1c2d3e4z0",
    chinese_name: "寿命状态",
    english_name: "Life Status",
    definition: "一个有寿命限制的部件的累计循环次数、小时数或任何其他强制性更换限制。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1r2s3t4-u5v6-4w7x-8y9z-a0b1c2d3e4f5a1",
    chinese_name: "有寿命限制的部件 (LLP)",
    english_name: "Life-limited Part (LLP)",
    definition: "在型号设计、持续适航说明或维修手册中规定了强制性更换限制的任何部件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2s3t4u5-v6w7-4x8y-9z0a-b1c2d3e4f5g6b2",
    chinese_name: "航线维修",
    english_name: "Line Maintenance",
    definition: "为确保飞机适合预定飞行而必须在飞行前进行的任何维修。它可能包括：\n• 故障排除；\n• 缺陷纠正；\n• 需要时使用外部测试设备进行部件更换；\n• 部件更换（可能包括发动机和螺旋桨等部件）；\n• 预定维修和/或检查，包括目视检查，将发现明显的不满意状况或差异，但不需要深入检查。\n它还可能包括内部结构、系统和动力装置项目，这些项目可通过快速打开的检修面板/门看到，以及不需要大量拆卸并可通过简单方法完成的轻微修理和改装。对于临时或偶发情况（ADs，SBs），质量经理可以接受由航线维修组织执行的基地维修任务，前提是所有要求都得到满足。当局将规定执行这些任务的条件。\n参见：基地维修(Base Maintenance)。",
    equivalent_terms: "",
    see_also: "Base Maintenance",
    see_also_array: ["Base Maintenance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3t4u5v6-w7x8-4y9z-0a1b-c2d3e4f5g6h7c3",
    chinese_name: "航线运行评估 (LOE)",
    english_name: "Line Operational Evaluation (LOE)",
    definition: "在飞行模拟设备中作为实时航线运行模拟(LOS)场景进行的个人和机组表现评估。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4u5v6w7-x8y9-4z0a-1b2c-d3e4f5g6h7i8d4",
    chinese_name: "航线运行飞行训练 (LOFT)",
    english_name: "Line Operational Flight Training (LOFT)",
    definition: "在飞行机组初始资格和/或复训期间进行的航线运行模拟(LOS)训练课程。LOFT以实时航线运行方式进行，教员在课程期间不中断，除非为了不干扰地加速平淡的航路段。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5v6w7x8-y9z0-4a1b-2c3d-e4f5g6h7i8j9e5",
    chinese_name: "航线运行模拟 (LOS)",
    english_name: "Line Operational Simulation (LOS)",
    definition: "在“航线环境”设置中进行的训练或评估课程。在LOS下，教学和训练基于CRM学习目标，并包括对机组表现的行为观察和评估。LOS下的特定训练活动包括：\n• 航线定向飞行训练(LOFT)；\n• 特殊目的运行训练(SPOT)；\n• 航线运行评估(LOE)。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6w7x8y9-z0a1-4b2c-3d4e-f5g6h7i8j9k0f6",
    chinese_name: "航线站 (LS)",
    english_name: "Line Station (LS)",
    definition: "进行指定飞机维修的地点。",
    equivalent_terms: "Line Maintenance Facility",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7x8y9z0-a1b2-4c3d-4e5f-g6h7i8j9k0l1g7",
    chinese_name: "航线训练",
    english_name: "Line Training",
    definition: "在运营人和/或国家为此目的授权的飞行员监督下，在实际航线运行中进行的飞行或客舱机组成员的训练或检查。\n参见：监督下的运行经验(Supervised Operating Experience (SOE))。",
    equivalent_terms: "",
    see_also: "Supervised Operating Experience (SOE)",
    see_also_array: ["Supervised Operating Experience (SOE)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8y9z0a1-b2c3-4d4e-5f6g-h7i8j9k0l1m2h8",
    chinese_name: "可接受故障清单",
    english_name: "List of Acceptable Malfunctions",
    definition: "某些俄罗斯制造的飞机型号的飞行手册的一部分，其中包含允许在飞行开始时不工作的特定设备清单，以及指定的操作条件、限制或程序。可接受故障清单由负责型号设计的组织为特定飞机型号制定，并经俄罗斯民航局型号批准。",
    equivalent_terms: "Master Minimum Equipment List (MMEL)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9z0a1b2-c3d4-4e5f-6g7h-i8j9k0l1m2n3i9",
    chinese_name: "有效页清单 (LEP)",
    english_name: "List of Effective Pages (LEP)",
    definition: "手册页及其当前修订状态的详细清单。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j0a1b2c3-d4e5-4f6g-7h8i-j9k0l1m2n3o4j0",
    chinese_name: "活体动物随行人员",
    english_name: "Live Animal Attendants",
    definition: "当动物运输需要由相关国家法律或提供运输的航空公司要求或因任何其他原因需要有人员陪同时，由托运人或承运人提供的合格随行人员。为合规目的，任何此类随行人员必须提前与相关航空公司联系，以了解并遵守适用的安全和安保措施。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5k1",
    chinese_name: "活体动物条例 (LAR)",
    english_name: "Live Animals Regulations (LAR)",
    definition: "由IATA发布的一份文件（手册），旨在为托运人、货运代理、运营人和动物护理专业人员提供以安全、人道和成本效益的方式通过空运运输动物的程序，并符合航空公司法规和动物福利标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2c3d4e5-f6g7-4h8i-9j0k-l1m2n3o4p5q6l2",
    chinese_name: "载重",
    english_name: "Load",
    definition: "飞机上运输的所有物品，包括人员和物品，但不包括燃料，并且不包括在基本操作重量中。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3d4e5f6-g7h8-4i9j-0k1l-m2n3o4p5q6r7m3",
    chinese_name: "载重控制",
    english_name: "Load Control",
    definition: "一个确保飞机容量的最佳利用和根据安全和运营要求分配载重的系统，并确保：\n• 飞机的重量和平衡条件正确并在限制范围内；\n• 飞机按照适用法规和特定航班的装载说明进行装载；\n• 载重单上的信息与飞机上的实际载重相符，包括乘客和燃料。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4e5f6g7-h8i9-4j0k-1l2m-n3o4p5q6r7s8n4",
    chinese_name: "载重计划",
    english_name: "Load Planning",
    definition: "载重控制系统的一部分，确保载重安全地装载在飞机上。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5f6g7h8-i9j0-4k1l-2m3n-o4p5q6r7s8t9o5",
    chinese_name: "载重单",
    english_name: "Load Sheet",
    definition: "一份包含特定航班重量数据的文件，包括：\n• 飞机、机组、餐食、燃料、乘客、行李、货物和邮件的重量，以及\n• 飞机上载重分布的详细信息。\n参见：平衡单(Balance Sheet)。",
    equivalent_terms: "",
    see_also: "Balance Sheet",
    see_also_array: ["Balance Sheet"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6g7h8i9-j0k1-4l2m-3n4o-p5q6r7s8t9u0p6",
    chinese_name: "装载指令",
    english_name: "Loading Instruction",
    definition: "由载重控制部门为负责飞机装载的人员制作的飞机装载指令。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7h8i9j0-k1l2-4m3n-4o5p-q6r7s8t9u0v1q7",
    chinese_name: "装载指令/报告 (LIR)",
    english_name: "Loading Instruction/Report (LIR)",
    definition: "由负责飞机装载的人员签署的装载指令，反映了实际飞机装载过程中发生的任何偏差，以供载重控制部门采取必要行动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8i9j0k1-l2m3-4n4o-5p6q-r7s8t9u0v1w2r8",
    chinese_name: "当地行李委员会 (LBC)",
    english_name: "Local Baggage Committee (LBC)",
    definition: "在机场的一个委员会，其成员为服务该机场的航空公司，定期开会讨论联运行李处理问题，解决行李问题，并在需要时制定和实施纠正措施。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9j0k1l2-m3n4-4o5p-6q7r-s8t9u0v1w2x3s9",
    chinese_name: "当地标准操作程序",
    english_name: "Local Standard Operating Procedure",
    definition: "在站点级别发布的受控文件，定义适用于当地和/或区域的运营程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0k1l2m3-n4o5-4p6q-7r8s-t9u0v1w2x3y4t0",
    chinese_name: "地点（维修）",
    english_name: "Location (Maintenance)",
    definition: "经适用当局批准，运营人或AMO在此进行飞机维修活动的地点。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1l2m3n4-o5p6-4q7r-8s9t-u0v1w2x3y4z5u1",
    chinese_name: "日志",
    english_name: "Log Book",
    definition: "参见：航空器技术日志(Aircraft Technical Log (ATL))。",
    equivalent_terms: "",
    see_also: "Aircraft Technical Log (ATL)",
    see_also_array: ["Aircraft Technical Log (ATL)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2m3n4o5-p6q7-4r8s-9t0u-v1w2x3y4z5a6v2",
    chinese_name: "远程导航",
    english_name: "Long-range Navigation",
    definition: "允许在特定区域或空域（例如，延程水上导航、极地导航、北太平洋导航和/或最低导航性能规范）进行飞机运行的专门导航方法。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3n4o5p6-q7r8-4s9t-0u1v-w2x3y4z5a6b7w3",
    chinese_name: "远程水上飞行",
    english_name: "Long-range Over-water Flights",
    definition: "飞机可能在水上飞行，且距离适合进行紧急降落的陆地的距离超过以下任一标准的航线上的飞行：\n(i) 巡航速度下120分钟或740公里（400海里），以较小者为准，适用于在航路任何一点一台发动机不工作的情况下，能够在不低于最低飞行高度的情况下飞抵并降落在合适机场（适合该机型）的飞机；\n(ii) 巡航速度下120分钟或740公里（400海里），以较小者为准，适用于能够遵守上述(i)款并且在航路任何一点同时两台发动机失效后，能够在不低于最低飞行高度的情况下飞抵并降落在合适机场（适合该机型）的多于两台发动机的飞机，该点距离合适机场的巡航速度超过90分钟；\n(iii) 巡航速度下35分钟或185公里（100海里），以较小者为准，适用于无法遵守上述(i)和(ii)款中概述的发动机不工作要求的飞机。\n参见：水上飞行(Over-water Flights)。",
    equivalent_terms: "",
    see_also: "Over-water Flights",
    see_also_array: ["Over-water Flights"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4o5p6q7-r8s9-4t0u-1v2w-x3y4z5a6b7c8x4",
    chinese_name: "低能见度运行 (LVO)",
    english_name: "Low Visibility Operations (LVO)",
    definition: "在RVR低于550米和/或DH低于60米（200英尺）的进近运行，或在RVR低于400米的起飞运行。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5p6q7r8-s9t0-4u1v-2w3x-y4z5a6b7c8d9y5",
    chinese_name: "邮件",
    english_name: "Mail",
    definition: "根据万国邮政联盟(UPU)的规则交由邮政服务并意图递送的信件和其他物品。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6q7r8s9-t0u1-4v2w-3x4y-z5a6b7c8d9e0z6",
    chinese_name: "磁场不可靠",
    english_name: "Magnetic Unreliability",
    definition: "参见：磁场不可靠区域(Areas of Magnetic Unreliability)。",
    equivalent_terms: "",
    see_also: "Areas of Magnetic Unreliability",
    see_also_array: ["Areas of Magnetic Unreliability"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7r8s9t0-u1v2-4w3x-4y5z-a6b7c8d9e0f1a7",
    chinese_name: "维修（航空器）",
    english_name: "Maintenance (Aircraft)",
    definition: "为将飞机、飞机发动机或飞机部件恢复或保持在适航和可用状态所需的行动，包括修理、改装、大修、检查、更换、缺陷纠正和状况确定。\n重大改装–未列在飞机或发动机规格中，并可能影响重量、平衡、结构强度、性能、动力装置运行、飞行特性或其他影响适航性品质的改装。\n轻微改装–任何未被归类为重大改装的改装。\n重大修理–如果修理不当，可能影响重量、平衡、结构强度、性能、动力装置运行、飞行特性或其他影响适航性品质的修理；或未按照公认惯例进行的修理；或无法通过基本操作完成的修理。\n轻微修理–任何未被归类为重大修理的修理。\n改装–按照批准的标准对飞机或飞机部件进行的更改。\n强制改装–被适用当局归类为强制性的改装。",
    equivalent_terms: "Aircraft Maintenance, Engine Maintenance, Component Maintenance",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8s9t0u1-v2w3-4x4y-5z6a-b7c8d9e0f1g2b8",
    chinese_name: "维修控制中心 (MCC)",
    english_name: "Maintenance Control Center (MCC)",
    definition: "一个组织的部门，设立为所有维修相关通信的焦点。",
    equivalent_terms: "Maintenance Watch, Maintenance Scheduling",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9t0u1v2-w3x4-4y5z-6a7b-c8d9e0f1g2h3c9",
    chinese_name: "维修控制手册 (MCM)",
    english_name: "Maintenance Control Manual (MCM)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM)) 和 维修程序手册(Maintenance Procedures Manual (MPM))。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM), Maintenance Procedures Manual (MPM)",
    see_also_array: ["Maintenance Management Manual (MMM)", "Maintenance Procedures Manual (MPM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0u1v2w3-x4y5-4z6a-7b8c-d9e0f1g2h3i4d0",
    chinese_name: "维修控制员",
    english_name: "Maintenance Controller",
    definition: "经适用当局批准，确保飞机、发动机和部件的维修以合规方式进行的人员。\n参见：岗位持有人(Post Holder)。",
    equivalent_terms: "",
    see_also: "Post Holder",
    see_also_array: ["Post Holder"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1v2w3x4-y5z6-4a7b-8c9d-e0f1g2h3i4j5e1",
    chinese_name: "维修数据",
    english_name: "Maintenance Data",
    definition: "确保飞机、飞机发动机或飞机部件能够维持在适航状态，或操作和应急设备（如适用）的可用性得到保证所需的任何信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2w3x4y5-z6a7-4b8c-9d0e-f1g2h3i4j5k6f2",
    chinese_name: "维修检查手册 (MIM)",
    english_name: "Maintenance Inspection Manual (MIM)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM))。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM)",
    see_also_array: ["Maintenance Management Manual (MMM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3x4y5z6-a7b8-4c9d-0e1f-g2h3i4j5k6l7g3",
    chinese_name: "维修指令",
    english_name: "Maintenance Instruction",
    definition: "参见：工程指令(Engineering Instruction)。",
    equivalent_terms: "EI, EO, ER",
    see_also: "Engineering Instruction",
    see_also_array: ["Engineering Instruction"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4y5z6a7-b8c9-4d0e-1f2g-h3i4j5k6l7m8h4",
    chinese_name: "维修管理手册 (MMM)",
    english_name: "Maintenance Management Manual (MMM)",
    definition: "一份通用文件，定义了运营人及其工程和维修组织和/或一个独立的批准维修组织(Approved Maintenance Organization)如何完成和控制其飞机维修活动。MMM可以由一本手册或一套手册组成。该文件包含工程和维修的管理程序，并列出进行维修的每个地点，包括维修类型、可执行维修的人员和认证要求、完成飞机维修的批准数据，以及维修组织及其高级职员的描述。MMM的目的是为所有工程和维修人员提供必要的信息，使他们能够完成其职责，并使当局能够证实运营人及其AMO如何遵守适用的适航要求。\n如果MMM是以一套手册的形式制作的，那么“主文件”应在引言中简要说明“MMM”由多个手册组成，其集体内容构成了MMM。\nMMM可以提取特定的“章节”以形成“定制”手册，分发给维修承包商、航线站和其他需要的人员。",
    equivalent_terms: "CAME, GMM, GPM, MIM, MME, MOM, MPM, PM, IPM, MCM, MOE, QM, QPM",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5z6a7b8-c9d0-4e1f-2g3h-i4j5k6l7m8n9i5",
    chinese_name: "维修手册 (MM)",
    english_name: "Maintenance Manual (MM)",
    definition: "参见：维修管理手册(Maintenance Management Manual (MMM))。\n注：MM不应与飞机维修手册(AMM)混淆。",
    equivalent_terms: "",
    see_also: "Maintenance Management Manual (MMM)",
    see_also_array: ["Maintenance Management Manual (MMM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6a7b8c9-d0e1-4f2g-3h4i-j5k6l7m8n9o0j6",
    chinese_name: "维修操作",
    english_name: "Maintenance Operations",
    definition: "确保飞机、飞机发动机和/或飞机部件维持在适航和可用状态所需行动的资源、部署和使用的总系统。该系统包括航线维修和基地维修。\n参见：基地维修(Base Maintenance), 航线维修(Line Maintenance), 维修（航空器）(Maintenance (Aircraft))。",
    equivalent_terms: "",
    see_also: "Base Maintenance, Line Maintenance, Maintenance (Aircraft)",
    see_also_array: ["Base Maintenance", "Line Maintenance", "Maintenance (Aircraft)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7b8c9d0-e1f2-4g3h-4i5j-k6l7m8n9o0p1k7",
    chinese_name: "维修组织",
    english_name: "Maintenance Organization",
    definition: "在飞机、发动机和部件上执行特定维修的组织。",
    equivalent_terms: "Approved Maintenance Organization (AMO)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8c9d0e1-f2g3-4h4i-5j6k-l7m8n9o0p1q2l8",
    chinese_name: "维修组织说明",
    english_name: "Maintenance Organization Exposition",
    definition: "描述批准维修组织(AMO)或维修、修理和大修组织(MRO)如何构建以实现其活动交付的正式文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9d0e1f2-g3h4-4i5j-6k7l-m8n9o0p1q2r3m9",
    chinese_name: "维修人员",
    english_name: "Maintenance Personnel",
    definition: "有资格在飞机、发动机和部件上执行维修的人员。",
    equivalent_terms: "AME, AMT, LAME, Mechanic, A and P Mechanic, Technician",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0e1f2g3-h4i5-4j6k-7l8m-n9o0p1q2r3s4n0",
    chinese_name: "维修计划",
    english_name: "Maintenance Planning",
    definition: "一个通用的维修职能，根据特定运营人的适用情况，可能包括：\n• 在维修生产中，子职能如计划和支持、生产计划、生产支持、飞机计划和/或计划支持；\n• 在航线维修中，子职能如维修调度、飞机分配和/或维修监控。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1f2g3h4-i5j6-4k7l-8m9n-o0p1q2r3s4t5o1",
    chinese_name: "维修计划文件 (MPD)",
    english_name: "Maintenance Planning Document (MPD)",
    definition: "由飞机制造商制定的文件，包含维持飞机持续适航所需的所有维修检查和检验。",
    equivalent_terms: "Maintenance Program, Maintenance System, Approved Maintenance Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2g3h4i5-j6k7-4l8m-9n0o-p1q2r3s4t5u6p2",
    chinese_name: "维修程序手册 (MPM)",
    english_name: "Maintenance Procedures Manual (MPM)",
    definition: "包含定义批准维修组织(Approved Maintenance Organization)如何执行其飞机维修活动的程序的文件。\n参见：维修管理手册(Maintenance Management Manual (MMM))。",
    equivalent_terms: "IPM, MCM, MOE, QM, QPM",
    see_also: "Maintenance Management Manual (MMM)",
    see_also_array: ["Maintenance Management Manual (MMM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3h4i5j6-k7l8-4m9n-0o1p-q2r3s4t5u6v7q3",
    chinese_name: "维修大纲",
    english_name: "Maintenance Program",
    definition: "描述特定预定维修任务及其完成频率以及相关程序（如可靠性计划）的文件，为安全运行这些飞机所必需。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4i5j6k7-l8m9-4n0o-1p2q-r3s4t5u6v7w8r4",
    chinese_name: "维修记录",
    english_name: "Maintenance Records",
    definition: "包含在飞机、飞机发动机或飞机部件上进行的维修详情的特定记录，通常包括所用数据、该维修的认证以及完成维修的人员姓名。",
    equivalent_terms: "Quality Records, Technical Records",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5j6k7l8-m9n0-4o1p-2q3r-s4t5u6v7w8x9s5",
    chinese_name: "维修放行",
    english_name: "Maintenance Release",
    definition: "一份包含认证的文件，确认与之相关的维修工作已按照批准的数据和运营人或AMO程序手册中描述的程序，或在同等系统下，以满意的方式完成。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6k7l8m9-n0o1-4p2q-3r4s-t5u6v7w8x9y0t6",
    chinese_name: "维修任务",
    english_name: "Maintenance Task",
    definition: "为达到将一个项目恢复或维持在可用状态的预期结果而需要的一个或一组行动，包括检查和状况确定。维修任务包括但不限于检查、功能检查、项目更换、润滑、校准、调整和清洁。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7l8m9n0-o1p2-4q3r-4s5t-u6v7w8x9y0z1u7",
    chinese_name: "维修技师",
    english_name: "Maintenance Technician",
    definition: "经当局认证，维护飞机结构、系统和设备以确保飞机适航的个人。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8m9n0o1-p2q3-4r4s-5t6u-v7w8x9y0z1a2v8",
    chinese_name: "故障集群",
    english_name: "Malfunction Clustering",
    definition: "故障的等效性。根据故障特征和管理它们所需的机组表现的基本要素确定的飞机系统故障的等效组。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9n0o1p2-q3r4-4s5t-6u7v-w8x9y0z1a2b3w9",
    chinese_name: "管理系统",
    english_name: "Management System",
    definition: "提供组织指导、监督和控制的管理人员和其他相关管理要素的集体。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0o1p2q3-r4s5-4t6u-7v8w-x9y0z1a2b3c4x0",
    chinese_name: "管理系统 (IEnvA)",
    english_name: "Management System (IEnvA)",
    definition: "运营人用于制定政策和目标，并建立实现这些政策和目标的必要流程的一组相互关联或相互作用的元素。这些元素包括结构、计划、程序、实践、计划、规则、角色、责任、关系、合同、协议、文件、记录、方法、工具、技术、技术和资源。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1p2q3r4-s5t6-4u7v-8w9x-y0z1a2b3c4d5y1",
    chinese_name: "强制性观察 (MOs)",
    english_name: "Mandatory Observations (MOs)",
    definition: "在审计期间对正常运营活动的观察，旨在评估某些IOSA标准或建议做法的规范是否正在实施。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2q3r4s5-t6u7-4v8w-9x0y-z1a2b3c4d5e6z2",
    chinese_name: "机动容差（飞行）",
    english_name: "Maneuver Tolerances (Flight)",
    definition: "在飞机或飞行模拟器中进行训练机动时，与已发布目标之间的已发布和定义的可允许偏差范围，其中包含了飞机或模拟器保真度的特定特性的容差。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3r4s5t6-u7v8-4w9x-0y1z-a2b3c4d5e6f7a3",
    chinese_name: "机动区",
    english_name: "Maneuvering Area",
    definition: "机场用于飞机起飞、着陆和滑行的部分；不包括停机坪。\n参见：活动区(Movement Area)。",
    equivalent_terms: "",
    see_also: "Movement Area",
    see_also_array: ["Movement Area"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4s5t6u7-v8w9-4x0y-1z2a-b3c4d5e6f7g8b4",
    chinese_name: "引导员",
    english_name: "Marshaller",
    definition: "在飞机地面移动期间执行飞机引导的人员。\n参见：飞机引导(Aircraft Marshalling)。",
    equivalent_terms: "Signalman",
    see_also: "Aircraft Marshalling",
    see_also_array: ["Aircraft Marshalling"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5t6u7v8-w9x0-4y1z-2a3b-c4d5e6f7g8h9c5",
    chinese_name: "主最低设备清单 (MMEL)",
    english_name: "Master Minimum Equipment List (MMEL)",
    definition: "由负责型号设计的组织为特定飞机型号制定，并经设计国型号批准的清单，其中包含允许在飞行开始时不工作的一个或多个项目。MMEL可能与特殊操作条件、限制或程序相关。",
    equivalent_terms: "List of Acceptable Malfunctions (Russian built aircraft)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6u7v8w9-x0y1-4z2a-3b4c-d5e6f7g8h9i0d6",
    chinese_name: "成熟度评估",
    english_name: "Maturity Assessment",
    definition: "成熟度评估是一个旨在确定运营人安全相关系统和计划的稳健性、适宜性和有效性的模型。\n注：成熟度评估是基于风险的IOSA方法学(RBI)的一个组成部分。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7v8w9x0-y1z2-4a3b-4c5d-e6f7g8h9i0j1e7",
    chinese_name: "成熟度水平",
    english_name: "Maturity Level",
    definition: "IOSA成熟度模型提供了一个框架，以确定航空公司安全相关系统和计划的成熟度。这些系统和计划超出了ICAO SMS框架，因为IOSA标准涵盖了运营安全和远超SMS本身的方面。\n注：应用成熟度评估模型可能得出以下成熟度水平：\n1. 符合性：过程/措施已根据要求文件化并适当实施。实施与组织的规模、性质和复杂性相称。\n2. 已建立：除了符合性外，过程/措施已在整个组织中一致且无缝地实施，并且已识别并可能实施了对原始设计的首次改进。\n3. 成熟：过程/措施已持续改进（例如，多年来），并完全整合到组织系统中。所有参与执行和改进过程/措施的员工都充分了解其职责，并积极为改进做出贡献。期望的结果始终如一地实现，实施了所有相关措施。持续改进和系统性有效性测量已经到位。\n4. 领先：基于基准和持续的领导力，过程/措施可以被认为是行业领先的。该组织积极参与推广和进一步发展该系统，并在行业内进行基准测试。所有管理系统都得到充分有效的整合。高级管理层完全了解并参与安全相关系统，并以身作则。组织内存在一种强大的安全和安保文化，并贯穿于各个层面。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8w9x0y1-z2a3-4b4c-5d6e-f7g8h9i0j1k2f8",
    chinese_name: "最大备降时间",
    english_name: "Maximum Diversion Time",
    definition: "从航路上的一个点到航路备降机场的最大允许航程，以时间表示。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9x0y1z2-a3b4-4c5d-6e7f-g8h9i0j1k2l3g9",
    chinese_name: "最低设备清单 (MEL)",
    english_name: "Minimum Equipment List (MEL)",
    definition: "一份允许在特定设备不工作的情况下，在规定条件下运行飞机的清单，由运营人准备并经当局批准，符合或比为该飞机型号制定的MMEL更具限制性。",
    equivalent_terms: "List of Acceptable Malfunctions (Russian built aircraft)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0y1z2a3-b4c5-4d6e-7f8g-h9i0j1k2l3m4h0",
    chinese_name: "最低航路高度 (MEA)",
    english_name: "Minimum En route Altitude (MEA)",
    definition: "航路飞行段的高度，提供相关导航设施的充分接收和ATS通信，符合空域结构并提供所需的障碍物清除。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1z2a3b4-c5d6-4e7f-8g9h-i0j1k2l3m4n5i1",
    chinese_name: "最低障碍物清除高度 (MOCA)",
    english_name: "Minimum Obstacle Clearance Altitude (MOCA)",
    definition: "为规定飞行段提供所需障碍物清除的最低高度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2a3b4c5-d6e7-4f8g-9h0i-j1k2l3m4n5o6j2",
    chinese_name: "最低导航性能规范 (MNPS)",
    english_name: "Minimum Navigation Performance Specifications (MNPS)",
    definition: "为在某些规定空域进行飞行运行而规定的程序和设备要求。\n参见：区域导航(Area Navigation (RNAV)), 北大西洋航迹高空空域(North Atlantic Track High Level Airspace (NAT HLA)), 导航规范(Navigation Specification)。",
    equivalent_terms: "",
    see_also: "Area Navigation, North Atlantic Track High Level Airspace (NAT HLA), Navigation Specification",
    see_also_array: ["Area Navigation", "North Atlantic Track High Level Airspace (NAT HLA)", "Navigation Specification"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3b4c5d6-e7f8-4g9h-0i1j-k2l3m4n5o6p7k3",
    chinese_name: "错运行李",
    english_name: "Mishandled Baggage",
    definition: "已与乘客或机组成员分离的托运行李。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4c5d6e7-f8g9-4h0i-1j2k-l3m4n5o6p7q8l4",
    chinese_name: "行动辅助设备",
    english_name: "Mobility Aid",
    definition: "一种旨在帮助行走或以其他方式改善因受伤、残疾、健康或年龄原因导致暂时或永久性行动障碍或问题的人的行动能力的设备。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5d6e7f8-g9h0-4i1j-2k3l-m4n5o6p7q8r9m5",
    chinese_name: "监控",
    english_name: "Monitoring",
    definition: "观察、检查、测量和/或评估运营、运营或环境系统、计划或功能的性能，以确定或验证是否满足规定要求的过程。\n参见：运营职能(Operational Function)。",
    equivalent_terms: "",
    see_also: "Operational Function",
    see_also_array: ["Operational Function"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6e7f8g9-h0i1-4j2k-3l4m-n5o6p7q8r9s0n6",
    chinese_name: "停泊",
    english_name: "Mooring",
    definition: "水面或水面上方的固定设施（例如码头、平台或浮筒），用于固定水上飞机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7f8g9h0-i1j2-4k3l-4m5n-o6p7q8r9s0t1o7",
    chinese_name: "停泊浮筒",
    english_name: "Mooring Buoy",
    definition: "通过链条或缆绳连接到深埋在水底的永久不可移动锚上的浮筒。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8g9h0i1-j2k3-4l4m-5n6o-p7q8r9s0t1u2p8",
    chinese_name: "活动区",
    english_name: "Movement Area",
    definition: "机场用于飞机起飞、着陆、滑行和拖曳的部分；包括机动区和停机坪。\n参见：机动区(Maneuvering Area)。",
    equivalent_terms: "",
    see_also: "Maneuvering Area",
    see_also_array: ["Maneuvering Area"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9h0i1j2-k3l4-4m5n-6o7p-q8r9s0t1u2v3q9",
    chinese_name: "多点定位 (MLAT)",
    english_name: "Multilateration (MLAT)",
    definition: "一种监视应用，可准确确定传输的位置，匹配传输中包含的任何身份数据，并将其发送到ATM系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0i1j2k3-l4m5-4n6o-7p8q-r9s0t1u2v3w4r0",
    chinese_name: "国家航空当局 (NAA)",
    english_name: "National Aviation Authority (NAA)",
    definition: "在一国境内管辖民用航空的监管机构。\n参见：监管当局(Regulatory Authority)。",
    equivalent_terms: "Civil Aviation Authority (CAA)",
    see_also: "Regulatory Authority",
    see_also_array: ["Regulatory Authority"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1j2k3l4-m5n6-4o7p-8q9r-s0t1u2v3w4x5s1",
    chinese_name: "国家民航安保计划",
    english_name: "National Civil Aviation Security Program",
    definition: "一国为保障民航运行免受非法干扰行为而制定的书面计划，通过考虑飞行的安全、规律和效率的法规、惯例和程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2k3l4m5-n6o7-4p8q-9r0s-t1u2v3w4x5y6t2",
    chinese_name: "导航数据完整性",
    english_name: "Navigation Data Integrity",
    definition: "从存储系统检索的航空数据元素在指定的航空数据处理链中未被损坏或丢失的保证程度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3l4m5n6-o7p8-4q9r-0s1t-u2v3w4x5y6z7u3",
    chinese_name: "导航规范",
    english_name: "Navigation Specification",
    definition: "支持在规定空域内进行基于性能的导航运行所需的一套飞机和机组要求。导航规范有两种：\n(i) RNAV规范：基于区域导航的导航规范，不包括机载性能监控和警报的要求，以前缀RNAV指定，例如RNAV 5, RNAV 1。\n(ii) RNP规范：基于区域导航的导航规范，包括机载性能监控和警报的要求，以前缀RNP指定，例如RNP 4, RNP APCH。\nRNP和RNAV规范指定如下：\n基础RNAV/RNP: RNP-5, RNAV-5\n海洋和远程导航应用: RNP 4, RNP 2, RNAV 10\n航路和终端导航应用: RNP 2, RNP 1, A-RNP, RNP APCH, RNP AR APCH, RNP 0.3, RNAV 5, RNAV 2, RNAV 1\n参见：基于性能的导航(Performance-based Navigation (PBN)), PBN导航规范AR(授权要求)(PBN Navigation Specification AR (Authorization Required))。",
    equivalent_terms: "",
    see_also: "Performance-based Navigation (PBN), PBN Navigation Specification AR (Authorization Required)",
    see_also_array: ["Performance-based Navigation (PBN)", "PBN Navigation Specification AR (Authorization Required)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4m5n6o7-p8q9-4r0s-1t2u-v3w4x5y6z7a8v4",
    chinese_name: "新的（维修参考）",
    english_name: "New (Maintenance Reference)",
    definition: "没有使用时间或循环次数的产品、附件、部件、零件或材料。",
    equivalent_terms: "Unused",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5n6o7p8-q9r0-4s1t-2u3v-w4x5y6z7a8b9w5",
    chinese_name: "不符合项",
    english_name: "Nonconformity",
    definition: "经审计员确定，运营人/提供商在文件化和/或实施方面未履行ISARPs/GOSARPs中规定的规范。\n参见：发现项(Finding), 观察项(Observation)。",
    equivalent_terms: "Nonconformance.",
    see_also: "Finding, Observation",
    see_also_array: ["Finding", "Observation"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6o7p8q9-r0s1-4t2u-3v4w-x5y6z7a8b9c0x6",
    chinese_name: "不符合项 (IEnvA)",
    english_name: "Nonconformity (IEnvA)",
    definition: "不符合项指未履行一项要求。当运营人未能满足一项要求时，就存在不符合项。由于要求的种类繁多，不符合项可以有多种形式。运营人可能未能符合（或未能遵守）像法律法规这样的强制性要求，或者像合同、协议、准则和标准（包括IEnvA标准）这样的自愿性要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7p8q9r0-s1t2-4u3v-4w5x-y6z7a8b9c0d1y7",
    chinese_name: "无损检测 (NDT)",
    english_name: "Non-destructive Testing (NDT)",
    definition: "用于检查飞机或发动机零件或部件的测试应用或方法，这些方法不会破坏或使物品或材料无法使用。此类测试的例子包括射线照相、涡流、染料渗透、超声波、热成像和磁粉检查。",
    equivalent_terms: "Non-Destructive Inspection (NDI)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8q9r0s1-t2u3-4v4w-5x6y-z7a8b9c0d1e2z8",
    chinese_name: "非致命防护装置",
    english_name: "Non-lethal Protective Device",
    definition: "一种旨在暂时使对手丧失能力、迷惑、延迟或约束的装置。装置类型可包括电击、化学、冲击射弹、物理约束、光和声。由于非致命武器具有暂时性效果，应与物理约束装置（例如手铐、柔性手铐、身体束带）结合使用。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9r0s1t2-u3v4-4w5x-6y7z-a8b9c0d1e2f3a9",
    chinese_name: "正常活动 (IEnvA)",
    english_name: "Normal Activities (IEnvA)",
    definition: "频繁发生的活动，例如日常或在标准操作环境下发生的活动，例如产生废物。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0s1t2u3-v4w5-4x6y-7z8a-b9c0d1e2f3g4b0",
    chinese_name: "北大西洋航迹高空空域 (NAT HLA)",
    english_name: "North Atlantic Track High Level Airspace (NAT HLA)",
    definition: "ICAO北大西洋系统规划组(NAT SPG)对北大西洋最低导航性能规范(MNPS)空域的重新命名，以支持NAT MNPS向PBN（基于性能的导航）过渡计划。\n参见：最低导航性能规范(Minimum Navigation Performance Specifications (MNPS))。",
    equivalent_terms: "",
    see_also: "Minimum Navigation Performance Specifications (MNPS)",
    see_also_array: ["Minimum Navigation Performance Specifications (MNPS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1t2u3v4-w5x6-4y7z-8a9b-c0d1e2f3g4h5c1",
    chinese_name: "前轮转向旁通销",
    english_name: "Nose Gear Steering Bypass Pin",
    definition: "安装在飞机前起落架液压系统转向机构中的专用销，用于停用转向功能。用于飞机的操作性后推和拖曳。此类设备的安装和拆卸主要由操作人员执行。",
    equivalent_terms: "Nose Wheel Steering Deactivation Pin, Lock Pin–Nose Gear Towing Lever, Steering Bypass Pin.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2u3v4w5-x6y7-4z8a-9b0c-d1e2f3g4h5i6d2",
    chinese_name: "航行通告 (NOTAM)",
    english_name: "NOTAM (Notice to Airmen)",
    definition: "由NAA发布的官方通知或通信，告知飞行员可能影响飞行操作的危险情况，或与航空设施、服务或程序相关的临时或永久性变更。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3v4w5x6-y7z8-4a9b-0c1d-e2f3g4h5i6j7e3",
    chinese_name: "致CoPA成员通知 (NoToCM)",
    english_name: "Notice to CoPA Members (NoToCM)",
    definition: "一份编号文件，用于向ISAGO审计员传达ISAGO计划和审计事宜。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4w5x6y7-z8a9-4b0c-1d2e-f3g4h5i6j7k8f4",
    chinese_name: "机长通知单 (NOTOC)",
    english_name: "NOTOC (Notification to Captain)",
    definition: "向机长提供的关于将要装载上机的危险品货物或其他特殊货物的准确清晰的书面或打印信息。",
    equivalent_terms: "NOTAC (Notification to Aircraft Commander), NOPIC (Notification to Pilot-in-command)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5x6y7z8-a9b0-4c1d-2e3f-g4h5i6j7k8l9g5",
    chinese_name: "观察项",
    english_name: "Observation",
    definition: "基于事实证据的文件化陈述，描述了与IOSA/ISSA/ISAGO建议做法的不符合性。\n注：术语“观察项”(Observation)特指与IOSA/ISSA/ISAGO建议做法的不符合性，而术语“观察项”(observation)是通用的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6y7z8a9-b0c1-4d2e-3f4g-h5i6j7k8l9m0h6",
    chinese_name: "职业健康与安全",
    english_name: "Occupational Health and Safety",
    definition: "在工作场所促进和维护安全与健康，其中包括控制工作场所风险、制定职业健康与安全法规、提供医疗和健康服务，以及普遍确保工人的福祉。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7z8a9b0-c1d2-4e3f-4g5h-i6j7k8l9m0n1i7",
    chinese_name: "职业健康与安全管理体系 (OH&S Management System)",
    english_name: "Occupational Health and Safety Management System OH&S Management System",
    definition: "用于实现职业健康与安全政策的管理体系或管理体系的一部分。\n注：OH&S管理体系的预期成果是预防工人的伤害和健康损害，并提供安全健康的工作场所。\n注：术语“职业健康与安全”(occupational health and safety) (OH&S) 和“职业安全与健康”(occupational safety and health) (OSH) 含义相同。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8a9b0c1-d2e3-4f4g-5h6i-j7k8l9m0n1o2j8",
    chinese_name: "职业健康与安全政策",
    english_name: "Occupational Health and Safety Policy",
    definition: "预防与工作相关的伤害和健康损害，并为工人提供安全健康工作场所的政策。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9b0c1d2-e3f4-4g5h-6i7j-k8l9m0n1o2p3k9",
    chinese_name: "机上资料库",
    english_name: "Onboard Library",
    definition: "要求在飞机上可供飞行机组在飞行准备和飞行期间使用的文件集合。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0c1d2e3-f4g5-4h6i-7j8k-l9m0n1o2p3q4l0",
    chinese_name: "一站式安保",
    english_name: "One-stop Security",
    definition: "一种概念，即乘客及其随行行李在离港时仅接受一次安检，即使旅程涉及多次中转。该概念要求相互接受用于验证乘客、行李、货物、飞机以及装载在飞机上运输的任何其他物品不含危险物品的关键安保程序，从而无需在中转、过境和目的地点重复此类安保程序。一站式安保通常通过协调或相互接受以下方面实现：\n• 关键安保措施中使用的设备的技术要求；\n• 从事关键安保措施实施的安保人员的审查和培训要求；\n• 关键安保措施的实施方法；\n• 评估合规性的程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1d2e3f4-g5h6-4i7j-8k9l-m0n1o2p3q4r5m1",
    chinese_name: "现场阶段",
    english_name: "On-site Phase",
    definition: "IOSA/ISSA或ISAGO审计过程中通常在运营人或提供商现场进行的程序和活动，从开幕会议或首次评估活动开始，到闭幕会议结束。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2e3f4g5-h6i7-4j8k-9l0m-n1o2p3q4r5s6n2",
    chinese_name: "开幕会议",
    english_name: "Opening Meeting",
    definition: "在审计现场评估阶段开始时举行的会议，允许审计组与运营人或提供商讨论审计计划以及与审计执行相关的其他安排、活动和信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3f4g5h6-i7j8-4k9l-0m1n-o2p3q4r5s6t7o3",
    chinese_name: "运行控制",
    english_name: "Operational Control",
    definition: "为飞机及其乘员的安全和安保，以及飞行的规律性和效率，对飞行的发起、继续、改道或终止行使权力。运行控制有两种主要系统：\n非共享–对飞行的运行控制权仅授予机长(PIC)；\n共享–对飞行的运行控制权授予：\n– PIC和飞行运行官员/飞行签派员(FOO)，或\n– PIC和指定的管理成员。\n部分共享–对飞行的运行控制权授予：\n– PIC和FOO在飞行前进行决策、行使职能、履行职责和/或任务。\n– 飞行期间由PIC行使。\n注：在运行控制的背景下，权力被定义为下达命令、做出决定、授予许可和/或提供批准的权力或权利。\n注：术语运行控制与飞行运行的控制和监督可互换使用。",
    equivalent_terms: "Flight Dispatch",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4g5h6i7-j8k9-4l0m-1n2o-p3q4r5s6t7u8p4",
    chinese_name: "运行增益",
    english_name: "Operational Credits",
    definition: "国家对配备自动着陆系统、平视显示器(HUD)或等效显示器、增强视觉系统(EVS)、合成视觉系统(SVS)或组合视觉系统(CVS)的飞机运行的批准。当运行增益涉及低能见度运行时，此类授权不应影响仪表进近程序的分类。\n注：运行增益包括：\n(a) 就进近禁止而言，低于机场运营最低标准的最低标准；\n(b) 降低或满足能见度要求；或\n(c) 通过机载能力补偿，要求较少的地面设施。\n注：关于配备自动着陆系统、HUD或等效显示器、EVS、SVS和CVS的飞机的运行增益指南包含在ICAO《全天候运行手册》(Doc 9365)中。\n注：关于HUD或等效显示器的信息，包括对RTCA和EUROCAE文件的引用，包含在ICAO《全天候运行手册》(Doc 9365)中。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5h6i7j8-k9l0-4m1n-2o3p-q4r5s6t7u8v9q5",
    chinese_name: "运行飞行计划 (OFP)",
    english_name: "Operational Flight Plan (OFP)",
    definition: "运营人为安全执行飞行而制定的计划，基于对飞机性能、其他运行限制以及沿途和相关机场的预期条件的考虑。OFP为每次预定飞行完成，由机长批准并签字，并在适用时由飞行运行官员/飞行签派员签字。OFP的副本通常提交给运营人或指定代理，留在机场当局处，或留在起飞机场的适当位置记录在案。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6i7j8k9-l0m1-4n2o-3p4q-r5s6t7u8v9w0r6",
    chinese_name: "运营职能",
    english_name: "Operational Function",
    definition: "由运营人/提供商的人员作为其飞机运行的一部分或直接支持其飞机运行而执行的工作、职责或任务。\n注：当在某些ISM或GOSM章节中使用时，术语“运营职能”可以根据该章节所涉及的具体运营学科进行更具体的定制。在这种情况下，该术语的上述基本定义仍然适用。\n注：术语“运营职能”不指或不包括运营产品（例如FMS数据库、EGPWS数据库、导航数据/手册、培训手册、天气/性能数据）。\n注：术语“运营职能”不指或不包括湿租或代码共享运行。\n参见：审计范围(IOSA)(Audit Scope (IOSA)), 审计范围(ISAGO)(Audit Scope (ISAGO)), 外包(Outsourcing)。",
    equivalent_terms: "",
    see_also: "Audit Scope (IOSA), Audit Scope (ISAGO), Outsourcing",
    see_also_array: ["Audit Scope (IOSA)", "Audit Scope (ISAGO)", "Outsourcing"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7j8k9l0-m1n2-4o3p-4q5r-s6t7u8v9w0x1s7",
    chinese_name: "运营经理",
    english_name: "Operational Manager",
    definition: "被分配负责监督和控制运营人组织内对运营有直接影响的职能区域的个人。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8k9l0m1-n2o3-4p4q-5r6s-t7u8v9w0x1y2t8",
    chinese_name: "运营绩效",
    english_name: "Operational Performance",
    definition: "运营的实际运营结果，通常以安全和安保方面，与预定义或预期结果（例如运营绩效目标）进行衡量。\n参见：可接受的安全绩效水平(Acceptable Level of Safety Performance (ALoSP)), 绩效衡量(Performance Measures)。",
    equivalent_terms: "",
    see_also: "Acceptable Level of Safety Performance (ALoSP), Performance Measures",
    see_also_array: ["Acceptable Level of Safety Performance (ALoSP)", "Performance Measures"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9l0m1n2-o3p4-4q5r-6s7t-u8v9w0x1y2z3u9",
    chinese_name: "运营人员",
    english_name: "Operational Personnel",
    definition: "经过培训并被授权执行与运营相关或直接支持运营的运营职能的人员（例如经理、主管、一线人员）。\n参见：运营职能(Operational Function)。",
    equivalent_terms: "",
    see_also: "Operational Function",
    see_also_array: ["Operational Function"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0m1n2o3-p4q5-4r6s-7t8u-v9w0x1y2z3a4v0",
    chinese_name: "运营安保人员",
    english_name: "Operational Security Personnel",
    definition: "运营人的员工，或执行航空安保职能的提供商的员工，经过相应民航安保当局的培训和/或认证，并被授权在货物和人员上应用安保控制，应用预防性安保措施以及管理对非法干扰行为的响应，包括：\n• 实施安保控制的人员；\n• 机组成员和一线地面处理人员；\n• 其他适用的运营人员。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1n2o3p4-q5r6-4s7t-8u9v-w0x1y2z3a4b5w1",
    chinese_name: "运营规范",
    english_name: "Operations Specifications",
    definition: "与航空运营人证书(AOC)相关的授权、条件和限制，并受运营手册(OM)中的条件约束。\n参见：航空运营人证书(Air Operator Certificate (AOC)), 运行手册(Operations Manual (OM))。",
    equivalent_terms: "",
    see_also: "Air Operator Certificate (AOC), Operations Manual (OM)",
    see_also_array: ["Air Operator Certificate (AOC)", "Operations Manual (OM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2o3p4q5-r6s7-4t8u-9v0w-x1y2z3a4b5c6x2",
    chinese_name: "运营差异",
    english_name: "Operational Variations",
    definition: "民航当局用于批准基于性能的替代规定性法规的偏差、替代符合性方法、豁免、让步、特别授权或其他文书。\n参见：基于性能的合规性(Performance-Based Compliance)。",
    equivalent_terms: "",
    see_also: "Performance-Based Compliance",
    see_also_array: ["Performance-Based Compliance"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3p4q5r6-s7t8-4u9v-0w1x-y2z3a4b5c6d7y3",
    chinese_name: "运营",
    english_name: "Operations",
    definition: "组织为交付产品或服务而进行的重复性活动。\n注：在ISM和GOSM中使用的术语“运营”主要指在飞行运营、运营控制、工程和维修、客舱运营、地面保障、货物运营和航空安保学科下进行的活动。\n注：在GOSM和GOPM中使用的术语“运营”指在载重控制、旅客和行李处理、飞机处理和装载、飞机地面移动以及货物和邮件学科下进行的活动。\n参见：航空器运行(Aircraft Operations)。",
    equivalent_terms: "",
    see_also: "Aircraft Operations",
    see_also_array: ["Aircraft Operations"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4q5r6s7-t8u9-4v0w-1x2y-z3a4b5c6d7e8z4",
    chinese_name: "运行控制中心 (OCC)",
    english_name: "Operations Control Center (OCC)",
    definition: "运营人组织结构内的一个办公室或部门，被赋予对正在进行的运营进行运营控制的责任，有权发起、延迟、改道和取消航班。OCC内的职能通常包括管理代表、飞行签派、飞行计划、机组调度、维修专家、气象人员、ATS专家和客户服务专家。OCC配备了完成所需职能所必需的通信设备、技术工具和支持材料；作为运营人的“神经中枢”，具有多个通信链路（例如，与航路中的航班、系统站点、政府机构以及载重控制、安保、技术和医疗职能）。OCC的规模和位置与运营的类型和规模相称；可能由少数或众多人员组成，并可能有一个或多个地点；所有职能集中在一个中央位置对于更好的沟通和协调是可取的。",
    equivalent_terms: "System Operations Center (SOC), Flight Control, CCO (French or Spanish)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5r6s7t8-u9v0-4w1x-2y3z-a4b5c6d7e8f9a5",
    chinese_name: "运行工程",
    english_name: "Operations Engineering",
    definition: "航空公司内负责分析、应用和/或定制以下内容的职能：\n• 飞机性能数据；\n• 基础设施（航路和机场）问题，包括FMS数据库定制和NOTAMs；\n• 设备规格和要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6s7t8u9-v0w1-4x2y-3z4a-b5c6d7e8f9g0b6",
    chinese_name: "运行手册 (OM)",
    english_name: "Operations Manual (OM)",
    definition: "一本手册或一系列手册，包含供运营人员在执行其职责时使用的程序、说明和指导。运营手册可以以特定学科标题的单独部分发布（例如飞行运行手册、飞机操作手册、培训手册、客舱运行手册、地面保障手册、旅客处理手册、货物运行手册等）。\n参见：航空器操作手册(Aircraft Operating Manual), 通用运行手册(General Operations Manual), 航路手册(Route Manual), 培训手册(Training Manual)。",
    equivalent_terms: "",
    see_also: "Aircraft Operating Manual, General Operations Manual, Route Manual, Training Manual",
    see_also_array: ["Aircraft Operating Manual", "General Operations Manual", "Route Manual", "Training Manual"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7t8u9v0-w1x2-4y3z-4a5b-c6d7e8f9g0h1c7",
    chinese_name: "运营人",
    english_name: "Operator",
    definition: "持有航空运营人证书(AOC)并从事商业客运和/或货运航空运输业务的组织。\n注：在ISM中使用的术语“运营人”是一个特定术语，意指被审计的运营人。\n注：在ISM和GOSM中使用的术语“运营人”是一个通用术语。",
    equivalent_terms: "Air Operator, Airline, AOC Holder",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8u9v0w1-x2y3-4z4a-5b6c-d7e8f9g0h1i2d8",
    chinese_name: "组织结构图",
    english_name: "Organogram",
    definition: "显示组织结构、各部分及其职位的关系和相对等级的图表。",
    equivalent_terms: "Organization Chart, Org. Chart",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9v0w1x2-y3z4-4a5b-6c7d-e8f9g0h1i2j3e9",
    chinese_name: "原始设备制造商 (OEM)",
    english_name: "Original Equipment Manufacturer (OEM)",
    definition: "任何硬件组件或子组件的原始制造商，包括飞机、飞机发动机、飞机部件和运营中使用的其他设备。",
    equivalent_terms: "Manufacturer",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0w1x2y3-z4a5-4b6c-7d8e-f9g0h1i2j3k4f0",
    chinese_name: "外包",
    english_name: "Outsourcing",
    definition: "一方（例如运营人或提供商）通常根据合同或有约束力的协议，将运营职能的执行转移给第二方（例如外部服务提供商）的商业实践。在外包下，第一方即使运营职能由第二方执行，仍对其产出或结果承担责任。\n参见：运营职能(Operational Function)。",
    equivalent_terms: "",
    see_also: "Operational Function",
    see_also_array: ["Operational Function"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g1x2y3z4-a5b6-4c7d-8e9f-g0h1i2j3k4l5g1",
    chinese_name: "大修（维修）",
    english_name: "Overhaul (Maintenance)",
    definition: "根据相关手册中定义的说明，将一个项目恢复到指定的零时状态。该过程适用于机身、飞机发动机、螺旋桨、设备或部件，使用当局认可的方法、技术和实践，该项目已：\n• 根据批准的数据，在可能的情况下被拆卸、清洁、检查、必要时修理和重新组装；\n• 根据批准的标准和技术数据，或当局接受的当前标准和技术数据（即制造商的数据），由型号合格证持有人、补充型号合格证(STC)持有人或零部件制造人批准持有人开发和文件化的标准和技术数据进行测试。",
    equivalent_terms: "Renewed, Reconditioned",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h2y3z4a5-b6c7-4d8e-9f0g-h1i2j3k4l5m6h2",
    chinese_name: "外包装",
    english_name: "Overpack",
    definition: "由单个托运人用于包含一个或多个包裹并形成一个处理单元以便于处理和存放的封装。外包装可以包含危险品包裹。\n注：一个集装单元不包括在此定义中。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i3z4a5b6-c7d8-4e9f-0g1h-i2j3k4l5m6n7i3",
    chinese_name: "悬挂货物",
    english_name: "Over-hang Cargo",
    definition: "伸出飞机集装单元底座的货物。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j4a5b6c7-d8e9-4f0g-1h2i-j3k4l5m6n7o8j4",
    chinese_name: "水上飞行",
    english_name: "Over-water Flights",
    definition: "飞机可能在以下情况下的飞行：\n• 在水上，距离海岸超过93公里（50海里），或在水上航路，超出滑翔距离，以较小者为准；\n• 在运营人所在国认为，起飞或进近路径位于水面上，以致于发生意外时很可能发生水上迫降的机场起飞或降落。\n参见：远程水上飞行(Long Range Over-water Flights)。",
    equivalent_terms: "",
    see_also: "Long Range Over-water Flights",
    see_also_array: ["Long Range Over-water Flights"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k5b6c7d8-e9f0-4g1h-2i3j-k4l5m6n7o8p9k5",
    chinese_name: "氧气发生器",
    english_name: "Oxygen Generator",
    definition: "一种含有化学物质的装置，激活后会释放氧气。",
    equivalent_terms: "Chemical Oxygen Generator, 02 Generator",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l6c7d8e9-f0g1-4h2i-3j4k-l5m6n7o8p9q0l6",
    chinese_name: "PANS-OPS（空中航行服务程序-飞机运行）",
    english_name: "PANS-OPS (Procedures for Air Navigation Services–Aircraft Operations)",
    definition: "ICAO出版物，为飞行员和飞行运营人员提供以下信息：\n• 飞行程序参数和运营程序；\n• 目视和仪表飞行程序的构建标准；\n• 障碍物清除标准。\n参见：TERPS(TERPS)。",
    equivalent_terms: "",
    see_also: "TERPS",
    see_also_array: ["TERPS"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m7d8e9f0-g1h2-4i3j-4k5l-m6n7o8p9q0r1m7",
    chinese_name: "纸质文件",
    english_name: "Paper Documentation",
    definition: "以印刷形式呈现或显示给用户的文件。\n参见：文件(Documentation)。",
    equivalent_terms: "",
    see_also: "Documentation",
    see_also_array: ["Documentation"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n8e9f0g1-h2i3-4j4k-5l6m-n7o8p9q0r1s2n8",
    chinese_name: "关联运营人的并行审计",
    english_name: "Parallel Audits of Affiliated Operators",
    definition: "对两个或多个具有显著共享运营水平的运营人进行的审计，其中运营人同时或相继进行审计。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o9f0g1h2-i3j4-4k5l-6m7n-o8p9q0r1s2t3o9",
    chinese_name: "并行符合性选项 (PCO)",
    english_name: "Parallel Conformity Option (PCO)",
    definition: "某些IOSA标准中包含的附加规范，允许运营人通过可选方式实现符合性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p0g1h2i3-j4k5-4l6m-7n8o-p9q0r1s2t3u4p0",
    chinese_name: "零件",
    english_name: "Part",
    definition: "拟用于飞机、飞机发动机或飞机部件的航空产品。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q1h2i3j4-k5l6-4m7n-8o9p-q0r1s2t3u4v5q1",
    chinese_name: "零部件制造人批准书 (PMA)",
    english_name: "Parts Manufacturer Approval (PMA)",
    definition: "授予制造商生产飞机零件的批准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r2i3j4k5-l6m7-4n8o-9p0q-r1s2t3u4v5w6r2",
    chinese_name: "旅客",
    english_name: "Passenger",
    definition: "由运营人在飞机上运输的人员，通常出于商业目的，且不是：\n• 执勤机组成员；\n• 额外人员。\n注：非执勤机组成员、公司员工和员工家属在客运航班上占用乘客座位时，为确定ISARPs的适用性，被视为乘客。\n参见：机组成员(Crew Member), 额外人员(Supernumerary)。",
    equivalent_terms: "",
    see_also: "Crew Member, Supernumerary",
    see_also_array: ["Crew Member", "Supernumerary"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s3j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7s3",
    chinese_name: "客机",
    english_name: "Passenger Aircraft",
    definition: "运输旅客的飞机。\n参见：旅客(Passenger)。",
    equivalent_terms: "",
    see_also: "Passenger",
    see_also_array: ["Passenger"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t4k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8t4",
    chinese_name: "旅客登机桥",
    english_name: "Passenger Boarding Bridge",
    definition: "从机场航站楼延伸至飞机，用于旅客登机和下机的伸缩式廊桥。",
    equivalent_terms: "Jetway, Air Bridge, Boarding Bridge, Loading Bridge, Loading gate, Boarding Gate",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u5l6m7n8-o9p0-4q1r-2s3t-u4v5w6x7y8z9u5",
    chinese_name: "旅客客舱",
    english_name: "Passenger Cabin",
    definition: "飞机上主要为运输旅客而设计的区域，配置有座位和/或铺位，以及旅客运营所需的其他系统和设备。",
    equivalent_terms: "Cabin",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v6m7n8o9-p0q1-4r2s-3t4u-v5w6x7y8z9a0v6",
    chinese_name: "客运航班",
    english_name: "Passenger Flight",
    definition: "运输旅客的航班。\n参见：旅客(Passenger)。",
    equivalent_terms: "",
    see_also: "Passenger",
    see_also_array: ["Passenger"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w7n8o9p0-q1r2-4s3t-4u5v-w6x7y8z9a0b1w7",
    chinese_name: "残疾旅客 (PWD)",
    english_name: "Passengers with Disabilities (PWD)",
    definition: "残疾是一个用于指代个人功能的术语，包括身体损伤，但也用于感觉损伤、认知损伤、智力损伤、精神疾病、神经发育状况和各种类型的慢性疾病。非显性残疾被定义为不立即明显的残疾。残疾旅客包括但不限于具有以下类型残疾和暂时或永久性状况的旅客：\n• 行动不便的人(PRM)；\n• 失明或视力低下的人；\n• 失聪或听力障碍的人；\n• 有言语障碍的人；\n• 有智力障碍的人；\n• 有认知障碍的人，包括有精神健康状况的人；\n• 患有疾病并经医疗机构授权旅行，但其行动能力因进行中的病理而受损的人；以及\n• 因受伤而无法站立或行走的人。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x8o9p0q1-r2s3-4t4u-5v6w-x7y8z9a0b1c2x8",
    chinese_name: "行动不便的旅客 (PRM)",
    english_name: "Passengers with Reduced Mobility (PRM)",
    definition: "行动不便的旅客被理解为因身体残疾（运动或感觉）、智力障碍、年龄、疾病或任何其他残疾原因而行动能力下降，并且需要特殊照顾和协助的人，超出提供给其他旅客的范围。这一要求将从旅客和/或其家人或医疗机构提出的特殊请求，或由航空公司人员或行业相关人员（旅行社等）报告中变得明显。机场和/或承运会员所需的协助水平可能因人们在旅行时的不同需求而异。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y9p0q1r2-s3t4-4u7v-8w9x-y0z1a2b3c4d5y9",
    chinese_name: "基于性能的通信 (PBC)",
    english_name: "Performance-based Communication (PBC)",
    definition: "基于应用于提供空中交通服务的性能规范的通信。\n参见：基于性能的通信和监视(Performance-based Communication and Surveillance (PBCS))。",
    equivalent_terms: "",
    see_also: "Performance-based Communication and Surveillance (PBCS)",
    see_also_array: ["Performance-based Communication and Surveillance (PBCS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z0q1r2s3-t4u5-4v8w-9x0y-z1a2b3c4d5e6z0",
    chinese_name: "基于性能的通信和监视 (PBCS)",
    english_name: "Performance-based Communication and Surveillance (PBCS)",
    definition: "一个应用所需通信性能(RCP)和所需监视性能(RCP)规范的框架，以确保在一个包括空中交通服务(ATS)和运营人使用此类服务的运营系统中，通信和监视能力及性能达到可接受的水平。\n参见：基于性能的通信(Performance-based Communication (PBC)), 基于性能的监视(Performance-based Surveillance (PBS))。",
    equivalent_terms: "",
    see_also: "Performance-based Communication (PBC), Performance-based Surveillance (PBS)",
    see_also_array: ["Performance-based Communication (PBC)", "Performance-based Surveillance (PBS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1r2s3t4-u5v6-4w9x-0y1z-a2b3c4d5e6f7a1",
    chinese_name: "基于性能的合规性",
    english_name: "Performance-based Compliance",
    definition: "一种基于安全风险的监管合规方法，涉及设定或应用系统或过程安全性能的目标水平，从而促进实施可变的法规或与现有规定性法规的运营差异。\n注：基于性能的合规性由持续监控系统实时性能、危险源和安全风险的主动运营人流程支持。",
    equivalent_terms: "",
    see_also: "Operational Variations",
    see_also_array: ["Operational Variations"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2s3t4u5-v6w7-4x0y-1z2a-b3c4d5e6f7g8b2",
    chinese_name: "基于性能的导航 (PBN)",
    english_name: "Performance-based Navigation (PBN)",
    definition: "基于飞机在空中交通服务(ATS)航路、仪表进近程序或指定空域中运行的性能要求的区域导航。\n注：性能要求以导航规范（RNAV规范、RNP规范）的形式表示，包括在特定空域概念的背景下，为拟议运行所需的准确性、完整性、连续性、可用性和功能性。\n参见：区域导航(Area Navigation (RNAV)), 导航规范(Navigation Specification)。",
    equivalent_terms: "",
    see_also: "Area Navigation (RNAV), Navigation Specification",
    see_also_array: ["Area Navigation (RNAV)", "Navigation Specification"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3t4u5v6-w7x8-4y1z-2a3b-c4d5e6f7g8h9c3",
    chinese_name: "PBN导航规范AR(授权要求)",
    english_name: "PBN Navigation Specification AR (Authorization Required)",
    definition: "一种批准，授权运营人在指定空域内使用特定飞机进行规定的PBN运行。当运营人向注册国/运营人所在国的监管机构证明特定飞机符合相关适航标准，并且持续适航和飞行运行要求得到满足时，可以向运营人颁发运营批准。\n参见：导航规范(Navigation Specification), 基于性能的导航(Performance-based Navigation (PBN))。",
    equivalent_terms: "",
    see_also: "Navigation Specification, Performance-based Navigation (PBN)",
    see_also_array: ["Navigation Specification", "Performance-based Navigation (PBN)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4u5v6w7-x8y9-4z2a-3b4c-d5e6f7g8h9i0d4",
    chinese_name: "基于性能的监管监督",
    english_name: "Performance-based Regulatory Oversight",
    definition: "一种补充基于合规性的监督方法，由国家民航当局采取，支持实施可变的法规或与现有规定性法规的差异，基于运营人可证明的能力以及纳入基于安全风险的方法来设定或应用安全性能目标水平。\n注：基于性能的监管监督组成部分依赖于持续监控系统实时性能、危险源和风险的国家流程，以确保在航空运输系统中实现安全性能目标水平。\n参见：基于符合性的监管监督(Compliance-Based Regulatory Oversight)。",
    equivalent_terms: "",
    see_also: "Compliance-Based Regulatory Oversight",
    see_also_array: ["Compliance-Based Regulatory Oversight"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5v6w7x8-y9z0-4a3b-4c5d-e6f7g8h9i0j1e5",
    chinese_name: "基于性能的监视 (PBS)",
    english_name: "Performance-based Surveillance (PBS)",
    definition: "基于应用于提供空中交通服务的性能规范的监视。\n参见：基于性能的通信和监视(Performance-based Communication and Surveillance (PBCS))。",
    equivalent_terms: "",
    see_also: "Performance-based Communication and Surveillance (PBCS)",
    see_also_array: ["Performance-based Communication and Surveillance (PBCS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6w7x8y9-z0a1-4b4c-5d6e-f7g8h9i0j1k2f6",
    chinese_name: "绩效衡量",
    english_name: "Performance Measures",
    definition: "为衡量达到的运营绩效水平而设定的目标（通常是数字或比率）的指标（或值）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7x8y9z0-a1b2-4c5d-6e7f-g8h9i0j1k2l3g7",
    chinese_name: "易腐货物条例 (PCR)",
    english_name: "Perishable Cargo Regulations (PCR)",
    definition: "由IATA发布的一份文件（手册），为所有参与易腐货物包装和处理的各方提供程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8y9z0a1-b2c3-4d6e-7f8g-h9i0j1k2l3m4h8",
    chinese_name: "绩效标准",
    english_name: "Performance Criteria",
    definition: "关于能力要素所需结果的简单、评估性陈述，以及用于衡量是否已达到所需绩效水平的标准的描述。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9z0a1b2-c3d4-4e7f-8g9h-i0j1k2l3m4n5i9",
    chinese_name: "个人电子设备 (PED)",
    english_name: "Personal Electronic Device (PED)",
    definition: "一种使用内部或外部供电的电动设备，其尺寸使其便携。这包括可能由乘客带上飞机的设备，例如：\n• 笔记本电脑和手机；\n• 由机组人员提供给乘客的设备，例如用于机上娱乐的DVD播放器；\n• 机组人员在执行其职责时可能使用的设备（例如免税销售点设备）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j0a1b2c3-d4e5-4f8g-9h0i-j1k2l3m4n5o6j0",
    chinese_name: "个人防护装备 (PPE)",
    english_name: "Personal Protective Equipment (PPE)",
    definition: "人员为防止操作伤害和健康危害而穿戴的设备或衣物。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1b2c3d4-e5f6-4g9h-0i1j-k2l3m4n5o6p7k1",
    chinese_name: "操纵飞行员 (PF)",
    english_name: "Pilot Flying (PF)",
    definition: "在飞行期间操作或指挥飞行控制器操作的飞行员机组成员。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2c3d4e5-f6g7-4h0i-1j2k-l3m4n5o6p7q8l2",
    chinese_name: "机长 (PIC)",
    english_name: "Pilot-in-Command (PIC)",
    definition: "由运营人指定为指挥飞机并负责运营控制和安全飞行的飞行员。",
    equivalent_terms: "Aircraft Commander, Captain, Commander",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3d4e5f6-g7h8-4i1j-2k3l-m4n5o6p7q8r9m3",
    chinese_name: "非操纵飞行员 (PNF)",
    english_name: "Pilot Not Flying (PNF)",
    definition: "监控和支持操纵飞行员(PF)的飞行员机组成员。",
    equivalent_terms: "Pilot Monitoring (PM)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4e5f6g7-h8i9-4j2k-3l4m-n5o6p7q8s0n4",
    chinese_name: "计划飞行重新签派",
    english_name: "Planned Flight Re-dispatch",
    definition: "一种飞行计划方法，要求航班为节省燃油、天气、目的地机场可用性或在没有目的地备降场的情况下进行计划而携带两份飞行计划。一份计划是从指定的或计划的重新签派点到计划的目的地。第二份计划是从起飞机场到指定的中间机场。在飞行中，在指定的或计划的重新签派点，做出决定是继续前往计划的目的地还是指定的中间机场。",
    equivalent_terms: "In-flight Re-planning, Planned Flight Re-release.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5f6g7h8-i9j0-4k3l-4m5n-o6p7q8r9s0t1o5",
    chinese_name: "安全返回点 (PSR)",
    english_name: "Point of Safe Return (PSR)",
    definition: "在偏远机场运行的背景下，PSR是沿给定航线的最后一个可能的备降至航路备降机场的地理点，超过该点后，航班将必须飞往目的地（偏远）机场。\n注：当与决策点计划结合使用时，PSR可能与最终决策点重合，或当与预定点程序结合使用时，与预定点重合。\n参见：偏远机场(Isolated Airport), 预定点程序(Pre-determined Point Procedure)。",
    equivalent_terms: "Point of no Return (PNR)",
    see_also: "Isolated Airport, Pre-determined Point Procedure",
    see_also_array: ["Isolated Airport", "Pre-determined Point Procedure"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6g7h8i9-j0k1-4l4m-5n6o-p7q8r9s0t1u2p6",
    chinese_name: "政策",
    english_name: "Policy",
    definition: "组织的既定意图和方向。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7h8i9j0-k1l2-4m5n-6o7p-q8r9s0t1u2v3q7",
    chinese_name: "政策和程序手册 (PPM)",
    english_name: "Policy and Procedure Manual (PPM)",
    definition: "一个手册（或在某些情况下，一系列手册）的通用名称，其中包含组织的政策和程序。此类手册向相关员工提供，通常包括最佳实践、工作执行标准/说明以及核心业务流程描述。与IOSA/ISSA和ISAGO相关的PPM示例包括飞机操作手册(AOM)、客舱运行手册、地面运行手册、坡道操作手册、旅客处理手册、货物运行手册以及适用于特定运营学科或职能的其他类似手册。\n参见：运行手册(Operations Manual (OM)), 程序手册(Procedure Manual (PM))。",
    equivalent_terms: "",
    see_also: "Operations Manual (OM), Procedure Manual (PM)",
    see_also_array: ["Operations Manual (OM)", "Procedure Manual (PM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8i9j0k1-l2m3-4n6o-7p8q-r9s0t1u2v3w4r8",
    chinese_name: "污染预防层次 (IEnvA)",
    english_name: "Pollution Prevention Hierarchy (IEnvA)",
    definition: "污染预防方法的层次结构，包括预防、减少、再利用（和回收）以及控制。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9j0k1l2-m3n4-4o7p-8q9r-s0t1u2v3w4x5s9",
    chinese_name: "便携式电子设备 (PED)",
    english_name: "Portable Electronic Device (PED)",
    definition: "任何可以移动并自带电源的电子设备。PED包括笔记本电脑和平板电脑、手持GPS设备和可从飞机上拆卸的导航设备。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0k1l2m3-n4o5-4p8q-9r0s-t1u2v3w4x5y6t0",
    chinese_name: "便携式电子设备 (PED) 货物",
    english_name: "Portable Electronic Device (PED) Cargo",
    definition: "作为货物一部分带上飞机的任何类型的电子设备，不包括在认证飞机的配置中。它包括所有能够消耗电能的设备。电能可以由内部源（如可充电或不可充电电池）提供，或者设备也可以连接到特定的飞机电源。\n参见：电子海图显示(Electronic Chart Display (ECD)), 电子检查单(Electronic Checklist (ECL)), 电子飞行包(Electronic Flight Bag (EFB))。",
    equivalent_terms: "",
    see_also: "Electronic Chart Display (ECD), Electronic Checklist (ECL), Electronic Flight Bag (EFB)",
    see_also_array: ["Electronic Chart Display (ECD)", "Electronic Checklist (ECL)", "Electronic Flight Bag (EFB)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1l2m3n4-o5p6-4q9r-0s1t-u2v3w4x5y6z7u1",
    chinese_name: "岗位持有人",
    english_name: "Post Holder",
    definition: "经当局批准或接受为负责运营人特定运营领域管理和监督的指定人员的个人。\n注：在ISM、ISSM和GOSM中使用的术语“岗位持有人”是通用的。个别国家可能会以不同的名称（例如，总监）称呼此职位。\n参见：权力(Authority)。",
    equivalent_terms: "",
    see_also: "Authority",
    see_also_array: ["Authority"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2m3n4o5-p6q7-4r0s-1t2u-v3w4x5y6z7a8v2",
    chinese_name: "实用手册",
    english_name: "Practical Manual",
    definition: "运营手册的精简版，设计供人员在执行一线操作时使用；包含从OM中选定的参考信息、政策、程序、插图、记忆辅助、检查单和/或其他必要材料，以确保在执行正常职责和处理非正常、异常和/或紧急情况时的标准化。",
    equivalent_terms: "Quick Reference Manual (QRM), Quick Reference Handbook (QRH)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3n4o5p6-q7r8-4s1t-2u3v-w4x5y6z7a8b9w3",
    chinese_name: "客改货飞机",
    english_name: "Preighter",
    definition: "一种专门设计用于运输旅客的飞机，但临时作为货机运营，在客舱内运输货物（无乘客）。\n参见：货机(Cargo Aircraft)。",
    equivalent_terms: "",
    see_also: "Cargo Aircraft",
    see_also_array: ["Cargo Aircraft"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4o5p6q7-r8s9-4t2u-3v4w-x5y6z7a8b9c0x4",
    chinese_name: "规定性合规",
    english_name: "Prescriptive Compliance",
    definition: "一种实现系统或过程安全性能目标水平的常规方法，基于运营人对预先建立的非可变标准或限制的遵守。\n参见：基于符合性的监管监督(Compliance-Based Regulatory Oversight)。",
    equivalent_terms: "",
    see_also: "Compliance-Based Regulatory Oversight",
    see_also_array: ["Compliance-Based Regulatory Oversight"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5p6q7r8-s9t0-4u3v-4w5x-y6z7a8b9c0d1y5",
    chinese_name: "预定点 (PDP) 程序",
    english_name: "Predetermined Point (PDP) Procedure",
    definition: "当目的地机场和目的地备降机场之间的距离使得航班只能通过运营人指定的固定地理点飞往其中一个机场时，使用的飞往目的地备降机场的飞行计划程序。该固定点代表前往目的地备降机场的最后一个改道点。\n注：当与决策点计划结合使用时，PDP可能与最终决策点重合，或当与偏远机场运行结合使用时，与PSR重合。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6q7r8s9-t0u1-4v4w-5x6y-z7a8b9c0d1e2z6",
    chinese_name: "初步审计报告",
    english_name: "Preliminary Audit Report",
    definition: "在审计结束前，由AO/主任审计员对IOSA审计报告(IAR)或ISAGO审计报告(GOAR)的任何全部或部分发布。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7r8s9t0-u1v2-4w5x-6y7z-a8b9c0d1e2f3a7",
    chinese_name: "污染预防 (IEnvA)",
    english_name: "Prevention of Pollution (IEnvA)",
    definition: "避免、减少或控制污染物或废料的产生、排放或排放。必须预防污染以减少不利的环境影响。运营人可以使用各种方法、技术、实践、流程、产品和服务来预防污染。这些包括在源头减少或消除污染；有效利用资源、材料和能源；资源的再利用、回收、再生和循环；流程、产品和服务的重新设计；以及用一种更清洁的能源或物质替代另一种能源或物质。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8s9t0u1-v2w3-4x6y-7z8a-b9c0d1e2f3g4b8",
    chinese_name: "预防措施",
    english_name: "Preventive Action",
    definition: "为消除潜在不符合项或潜在不良状况或情况的原因并防止其发生而采取的行动。\n参见：纠正措施(Corrective Action)。",
    equivalent_terms: "",
    see_also: "Corrective Action",
    see_also_array: ["Corrective Action"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9t0u1v2-w3x4-4y7z-8a9b-c0d1e2f3g4h5c9",
    chinese_name: "有问题的物质使用",
    english_name: "Problematic Use of Substances",
    definition: "航空人员以以下方式使用一种或多种精神活性物质：\n• 对使用者构成直接危害或危及他人生命、健康或福利，和/或\n• 导致或加重职业、社会、心理或身体问题或障碍。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0u1v2w3-x4y5-4z8a-9b0c-d1e2f3g4h5i6d0",
    chinese_name: "程序",
    english_name: "Procedure",
    definition: "为达到规定结果而以规定或逐步方式完成的一系列有组织的行动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1v2w3x4-y5z6-4a9b-0c1d-e2f3g4h5i6j7e1",
    chinese_name: "程序手册 (PM)",
    english_name: "Procedures Manual (PM)",
    definition: "一份包含通常符合当局、制造商、运营人和/或提供商标准或要求的各种程序的文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2w3x4y5-z6a7-4b0c-1d2e-f3g4h5i6j7k8f2",
    chinese_name: "过程",
    english_name: "Process",
    definition: "为实现一个目标、一个定义的结果或满足一个要求而以协调方式实施的一个或多个行动或程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3x4y5z6-a7b8-4c1d-2e3f-g4h5i6j7k8l9g3",
    chinese_name: "基于过程的审计方法",
    english_name: "Process Based Audit Approach",
    definition: "基于过程的审计方法侧重于审查过程的顺序和相互作用及其输入和输出。它分析管理系统，不仅仅是作为一套文件化的程序，而是作为一个处理风险及其适用要求的活动过程系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4y5z6a7-b8c9-4d2e-3f4g-h5i6j7k8l9m0h4",
    chinese_name: "计划",
    english_name: "Program",
    definition: "为共同目的、目标或宗旨而组织的一套过程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5z6a7b8-c9d0-4e3f-4g5h-i6j7k8l9m0n1i5",
    chinese_name: "保护区",
    english_name: "Protected Area",
    definition: "一个受保护免受可能危及水上飞机运行的大浪的区域；提供保护的结构可以是自然的或人造的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6a7b8c9-d0e1-4f4g-5h6i-j7k8l9m0n1o2j6",
    chinese_name: "保护过程",
    english_name: "Protection Processes",
    definition: "参见：工作场所安全(Workplace Safety)。",
    equivalent_terms: "",
    see_also: "Workplace Safety",
    see_also_array: ["Workplace Safety"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7b8c9d0-e1f2-4g5h-6i7j-k8l9m0n1o2p3k7",
    chinese_name: "防护呼吸设备 (PBE)",
    english_name: "Protective Breathing Equipment (PBE)",
    definition: "保护眼睛、鼻子和嘴巴，并在规定时间内提供呼吸氧气的便携式或非便携式设备；供机组成员在飞行中发生烟雾、火灾或有害烟雾或气体时使用。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8c9d0e1-f2g3-4h6i-7j8k-l9m0n1o2p3q4l8",
    chinese_name: "提供商",
    english_name: "Provider",
    definition: "在合同基础上向航空运营人提供服务（例如维修、地面保障、培训）的组织。\n注：在GOSM中使用的术语“提供商”是一个特定术语，意指被审计的提供商。\n注：在ISM和GOSM中使用的术语“提供商”是一个通用术语。\n参见：地面服务提供商(Ground Services Provider (GSP))。",
    equivalent_terms: "Service Provider, Service Vendor",
    see_also: "Ground Services Provider (GSP)",
    see_also_array: ["Ground Services Provider (GSP)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9d0e1f2-g3h4-4i7j-8k9l-m0n1o2p3q4r5m9",
    chinese_name: "提供商安保计划",
    english_name: "Provider Security Program",
    definition: "为保障国际民用航空免受非法干扰行为而采纳的要求和/或标准的计划。提供商安保计划符合国家和运营所在国民航安保当局的要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0e1f2g3-h4i5-4j8k-9l0m-n1o2p3q4r5s6n0",
    chinese_name: "条款",
    english_name: "Provision",
    definition: "任何IOSA/ISSA/ISAGO标准或建议做法的通用术语。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1f2g3h4-i5j6-4k9l-0m1n-o2p3q4r5s6t7o1",
    chinese_name: "精神活性物质",
    english_name: "Psychoactive Substances",
    definition: "能在人体内产生情绪变化或扭曲感知的物质，包括但不限于酒精、阿片类药物、大麻素、镇静剂和催眠药、可卡因、其他精神刺激剂、致幻剂和挥发性溶剂；咖啡和烟草不包括在内。",
    equivalent_terms: "Psychoactive Drugs",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2g3h4i5-j6k7-4l0m-1n2o-p3q4r5s6t7u8p2",
    chinese_name: "公共卫生紧急事件 (PHE)",
    english_name: "Public Health Emergency (PHE)",
    definition: "由国家宣布的紧急状态，当存在由生物恐怖主义、流行病或大流行病，或由新型和高致命性传染性病原体或生物毒素引起的疾病或健康状况的发生或迫在眉睫的威胁，对人口构成重大风险时；PHE也可以在世界卫生组织(WHO)启动后由国家宣布；宣布PHE允许暂停国家法规和改变国家机构的职能。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3h4i5j6-k7l8-4m1n-2o3p-q2r3s4t5u6v7q3",
    chinese_name: "质量",
    english_name: "Quality",
    definition: "一个系统持续满足规定要求、满足既定需求或产生期望结果的程度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4i5j6k7-l8m9-4n2o-1p2q-r3s4t5u6v7w8r4",
    chinese_name: "质量保证 (QA)",
    english_name: "Quality Assurance (QA)",
    definition: "对管理系统和运营职能进行审计和评估的正式和系统化过程，以确保：\n• 符合监管和内部要求；\n• 满足既定的运营需求；\n• 识别不良状况和需要改进的领域；\n• 识别危险源；\n• 评估安全和安保风险控制的有效性。",
    equivalent_terms: "Internal Evaluation, Compliance Monitoring",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5j6k7l8-m9n0-4o3p-2q4r-s5t6u7v8w9x0s5",
    chinese_name: "质量保证经理",
    english_name: "Quality Assurance Manager",
    definition: "被分配管理系统内质量保证职能职责的个人。",
    equivalent_terms: "Quality Manager, Manager Quality (MQ), Manager Quality Assurance (MQA), QAM, Compliance Monitoring Manager",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6k7l8m9-n0o1-4p4q-3r5s-t6u7v8w9x0y1t6",
    chinese_name: "质量审计",
    english_name: "Quality Audit",
    definition: "对组织的活动、记录、系统、计划、过程和其他要素进行的定期、独立和文件化的检查与验证，以确定与适用法规、标准和其他要求的符合或一致程度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7l8m9n0-o1p2-4q5r-4s6t-u7v8w9x0y1z2u7",
    chinese_name: "质量控制 (QC)",
    english_name: "Quality Control (QC)",
    definition: "对过程的产出（可能是产品、服务或功能）进行的审计、检查或测试，以确定其是否符合技术、性能和/或质量标准。质量控制活动通常由对其各自运营区域的安全和/或安保负有直接责任的运营、维修或安保经理发起。",
    equivalent_terms: "Product Inspection, Product Audit, Frontline Inspection, Line Check, Line Evaluation.",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8m9n0o1-p2q3-4r6s-5t7u-v8w9x0y1z2a3v8",
    chinese_name: "质量管理体系 (QMS)",
    english_name: "Quality Management System (QMS)",
    definition: "为确保所有运营活动满足客户和监管要求而实施的组织活动、计划、政策、程序、过程、资源、责任和基础设施的总和。使用受控文件系统来反映用于实现持续和一致的实施与合规的计划、政策、程序、过程、资源、责任和基础设施。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9n0o1p2-q3r4-4s7t-6u8v-w9x0y1z2a3b4w9",
    chinese_name: "质量手册 (QM)",
    english_name: "Quality Manual (QM)",
    definition: "阐明组织（例如运营人、AMO、服务提供商）的质量政策并描述该组织的质量管理体系的文件，包括体系的范围、为体系建立的程序以及体系内过程之间的相互作用。\n参见：维修管理手册(Maintenance Management Manual (MMM)), 维修程序手册(Maintenance Procedures Manual (MPM))。",
    equivalent_terms: "Quality Policy Manual.",
    see_also: "Maintenance Management Manual (MMM), Maintenance Procedures Manual (MPM)",
    see_also_array: ["Maintenance Management Manual (MMM)", "Maintenance Procedures Manual (MPM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0o1p2q3-r4s5-4t8u-7v9w-x0y1z2a3b4c5x0",
    chinese_name: "质量目标",
    english_name: "Quality Objectives",
    definition: "运营人可用于提高其产品、服务价值的目标。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1p2q3r4-s5t6-4u9v-8w0x-y1z2a3b4c5d6y1",
    chinese_name: "质量政策",
    english_name: "Quality Policy",
    definition: "组织（运营人、AMO、服务提供商）关于质量的总体意图和方向，由指导和控制组织的管理人员（例如负责任高管）批准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2q3r4s5-t6u7-4v0w-9x1y-z2a3b4c5d6e7z2",
    chinese_name: "质量体系标准",
    english_name: "Quality System Standards",
    definition: "在组织内实现规定质量水平的框架。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3r4s5t6-u7v8-4w1x-0y2z-a3b4c5d6e7f8a3",
    chinese_name: "隔离（维修）",
    english_name: "Quarantine (Maintenance)",
    definition: "在发现未被声明为可用的部件或材料时采取的行动，该部件或材料需接受调查或进一步处理。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4s5t6u7-v8w9-4x2y-1z3a-b4c5d6e7f8g9b4",
    chinese_name: "隔离区",
    english_name: "Quarantine Area",
    definition: "一个预留区域，用于存放待调查或进一步处理的部件或材料。该区域必须明确界定并加以保护，以防止在调查或进一步处理完成前移除部件或材料。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5t6u7v8-w9x0-4y3z-2a4b-c5d6e7f8g9h0c5",
    chinese_name: "快速转换飞机",
    english_name: "Quick Change Aircraft",
    definition: "设计用于在主甲板上运输乘客或货物（但非组合）的飞机；当以货物配置运行时，适用于货机的标准适用。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6u7v8w9-x0y1-4z4a-3b5c-d6e7f8g9h0i1d6",
    chinese_name: "坡道",
    english_name: "Ramp",
    definition: "参见：停机坪(Apron)。",
    equivalent_terms: "",
    see_also: "Apron",
    see_also_array: ["Apron"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7v8w9x0-y1z2-4a5b-4c6d-e7f8g9h0i1j2e7",
    chinese_name: "坡道运行",
    english_name: "Ramp Operations",
    definition: "在机场坡道区域发生的所有飞机活动。",
    equivalent_terms: "Tarmac Operations",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8w9x0y1-z2a3-4b6c-5d7e-f8g9h0i1j2k3f8",
    chinese_name: "接收机自主完好性监测 (RAIM)",
    english_name: "Receiver Autonomous Integrity Monitoring (RAIM)",
    definition: "一种用于评估GPS接收器系统中全球定位系统(GPS)信号完整性的技术。每个GPS卫星的位置、路径和预定中断都已公布，因此，系统可以提前计算出没有足够GPS覆盖的地理区域。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9x0y1z2-a3b4-4c7d-6e8f-g9h0i1j2k3l4g9",
    chinese_name: "接收检查（维修）",
    english_name: "Receiving Inspection (Maintenance)",
    definition: "一个组织中负责接收、检查、测试、评估和放行所有新的、修理和/或翻新的飞机部件的区域。",
    equivalent_terms: "Receipt Inspection, Stores Inspection",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0y1z2a3-b4c5-4d8e-7f9g-h0i1j2k3l4m5h0",
    chinese_name: "建议做法",
    english_name: "Recommended Practice",
    definition: "一项规定，指定了在IOSA/ISSA/ISAGO审计范围内的系统、政策、计划、过程、程序、计划、措施、设施、部件、设备类型或任何其他运营方面，运营人/提供商对其的符合性是可选的，但又是可取的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1z2a3b4-c5d6-4e9f-8g0h-i1j2k3l4m5n6i1",
    chinese_name: "缩减垂直间隔标准 (RVSM)",
    english_name: "Reduced Vertical Separation Minima (RVSM)",
    definition: "空中交通管制(ATC)在290至410（含）飞行高度层之间的特定空域内，对运行的飞机应用的300米（1000英尺）的最小垂直间隔。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2a3b4c5-d6e7-4f0g-9h1i-j2k3l4m5n6o7j2",
    chinese_name: "注册",
    english_name: "Registration",
    definition: "参见：IOSA注册(IOSA Registration)。",
    equivalent_terms: "",
    see_also: "IOSA Registration",
    see_also_array: ["IOSA Registration"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3b4c5d6-e7f8-4g1h-0i2j-k3l4m5n6o7p8k3",
    chinese_name: "注册更新审计",
    english_name: "Registration Renewal Audit",
    definition: "为进行IOSA注册更新而对IOSA运营人进行的审计。\n参见：审计(Audit), IOSA运营人(IOSA Operator), IOSA注册(IOSA Registration)。",
    equivalent_terms: "",
    see_also: "Audit, IOSA Operator, IOSA Registration",
    see_also_array: ["Audit", "IOSA Operator", "IOSA Registration"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4c5d6e7-f8g9-4h2i-1j3k-l4m5n6o7p8q9l4",
    chinese_name: "受监管代理人",
    english_name: "Regulated Agent",
    definition: "与运营人或运营人的代表有业务往来，并提供适用民航安保当局就货物或邮件所接受或要求的安保控制的代理人、货运代理或其他实体。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5d6e7f8-g9h0-4i3j-2k4l-m5n6o7p8q9r0m5",
    chinese_name: "监管当局",
    english_name: "Regulatory Authority",
    definition: "由国家政府为监管目的指定或以其他方式承认的组织，负责发布与保护和安全相关的规则和法规。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6e7f8g9-h0i1-4j4k-3l5m-n6o7p8q9r0s1n6",
    chinese_name: "可靠性（维修）",
    english_name: "Reliability (Maintenance)",
    definition: "一个项目在规定条件下，在规定时间内无故障地执行所需功能的概率。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7f8g9h0-i1j2-4k5l-4m6n-o7p8q9r0s1t2o7",
    chinese_name: "可靠性计划（维修）",
    english_name: "Reliability Program (Maintenance)",
    definition: "基于维修统计数据的飞机、飞机发动机和飞机部件可靠性计划。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8g9h0i1-j2k3-4l6m-5n7o-p8q9r0s1t2u3p8",
    chinese_name: "远程审计",
    english_name: "Remote Audit",
    definition: "在没有任何现场证据核实的情况下对运营人进行的审计；使用文件和记录审查以及电话会议技术进行远程审计。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9h0i1j2-k3l4-4m7n-6o8p-q9r0s1t2u3v4q9",
    chinese_name: "远程驾驶员站",
    english_name: "Remote Pilot Station",
    definition: "无人机系统（或遥控飞机系统）中包含用于驾驶无人机的设备的组件。\n参见：无人机系统(Unmanned Aerial System (UAS))。",
    equivalent_terms: "",
    see_also: "Unmanned Aerial System (UAS)",
    see_also_array: ["Unmanned Aerial System (UAS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0i1j2k3-l4m5-4n8o-7p9q-r0s1t2u3v4w5r0",
    chinese_name: "遥控飞机 (RPA)",
    english_name: "Remotely-piloted Aircraft (RPA)",
    definition: "参见：无人机(Unmanned Aerial Vehicle (UAV))。",
    equivalent_terms: "",
    see_also: "Unmanned Aerial Vehicle (UAV)",
    see_also_array: ["Unmanned Aerial Vehicle (UAV)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1j2k3l4-m5n6-4o9p-8q0r-s1t2u3v4w5x6s1",
    chinese_name: "遥控飞机系统 (RPAS)",
    english_name: "Remotely-piloted Aircraft System (RPAS)",
    definition: "参见：无人机系统(Unmanned Aerial System (UAS))。",
    equivalent_terms: "",
    see_also: "Unmanned Aerial System (UAS)",
    see_also_array: ["Unmanned Aerial System (UAS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2k3l4m5-n6o7-4p0q-9r1s-t2u3v4w5x6y7t2",
    chinese_name: "修理",
    english_name: "Repair",
    definition: "将飞机、飞机发动机或飞机部件恢复到可用状态并符合批准的标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3l4m5n6-o7p8-4q1r-0s2t-u3v4w5x6y7z8u3",
    chinese_name: "修理站证书",
    english_name: "Repair Station Certificate",
    definition: "由NAA颁发的证书。",
    equivalent_terms: "Approved Maintenance Organization, AMO",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4m5n6o7-p8q9-4r2s-1t3u-v4w5x6y7z8a9v4",
    chinese_name: "所需通信性能 (RCP)",
    english_name: "Required Communication Performance (RCP)",
    definition: "支持特定ATM功能的运营通信性能要求的陈述。RCP通常有一个数字附录（例如RCP 240），代表分配给通信事务时间、连续性、可用性和完整性的RCP参数值。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5n6o7p8-q9r0-4s3t-2u4v-w5x6y7z8a9b0w5",
    chinese_name: "所需导航性能 (RNP)",
    english_name: "Required Navigation Performance (RNP)",
    definition: "在规定空域内飞机运行所需的导航性能的陈述。\n注：导航性能和要求是为特定的RNP类型和/或应用定义的。\n参见：区域导航(Area Navigation), 导航规范(Navigation Specification)。",
    equivalent_terms: "",
    see_also: "Area Navigation, Navigation Specification",
    see_also_array: ["Area Navigation", "Navigation Specification"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6o7p8q9-r0s1-4t4u-3v5w-x6y7z8a9b0c1x6",
    chinese_name: "要求",
    english_name: "Requirement",
    definition: "被认为是运营必需的规范；通常是强制性的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7p8q9r0-s1t2-4u5v-4w6x-y7z8a9b0c1d2y7",
    chinese_name: "救援和消防服务 (RFFS)",
    english_name: "Rescue and Fire Fighting Services (RFFS)",
    definition: "在机场提供的专门用于支持飞机运行的救援和消防服务。包括涉及机场（或可能在机场外）地面事故中飞机乘客和机组人员的响应、危险缓解、疏散和可能救援的特殊消防类别。",
    equivalent_terms: "Airport Rescue Fire Fighting (ARFF), Crash Fire Rescue (CFR)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8q9r0s1-t2u3-4v6w-5x7y-z8a9b0c1d2e3z8",
    chinese_name: "资源管理",
    english_name: "Resource Management",
    definition: "有效利用人员可用的所有资源，包括彼此，以实现安全高效的结果。\n参见：机组资源管理(Crew Resource Management)。",
    equivalent_terms: "",
    see_also: "Crew Resource Management",
    see_also_array: ["Crew Resource Management"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9r0s1t2-u3v4-4w7x-6y8z-a9b0c1d2e3f4a9",
    chinese_name: "责任",
    english_name: "Responsibility",
    definition: "执行或履行指派的职能、职责、任务或行动的义务；通常包括适当级别的授权；意味着担任特定的办公室、头衔或职位。\n参见：权力(Authority)。",
    equivalent_terms: "",
    see_also: "Authority",
    see_also_array: ["Authority"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0s1t2u3-v4w5-4x8y-7z9a-b0c1d2e3f4g5b0",
    chinese_name: "休息期",
    english_name: "Rest Period",
    definition: "机组成员在地面上被运营人解除所有职责的任何时间段。",
    equivalent_terms: "Crew Rest",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1t2u3v4-w5x6-4y9z-8a0b-c1d2e3f4g5h6c1",
    chinese_name: "RFP摘要表",
    english_name: "RFP Summary Sheet",
    definition: "审计协议的必需附件，定义了与进行审计相关的个人固定和可变成本。\n注：RFP是“征求建议书”的缩写。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2u3v4w5-x6y7-4z0a-9b1c-d2e3f4g5h6i7d2",
    chinese_name: "风险",
    english_name: "Risk",
    definition: "参见：安全风险(Safety Risk)。",
    equivalent_terms: "",
    see_also: "Safety Risk",
    see_also_array: ["Safety Risk"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3v4w5x6-y7z8-4a1b-0c2d-e3f4g5h6i7j8e3",
    chinese_name: "基于风险的审计",
    english_name: "Risk Based Audit",
    definition: "一种审计方法，其中审计计划由风险概况和安全绩效的组合驱动；并且执行侧重于风险管理，此外还确保单个运营人审计范围的符合性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4w5x6y7-z8a9-4b2c-1d3e-f4g5h6i7j8k9f4",
    chinese_name: "风险登记册",
    english_name: "Risk Register",
    definition: "与组织风险管理相关的书面信息的集中汇编；登记册通常为每个风险提供：\n• 相关信息、数据和历史记录的单一访问点；\n• 背景和描述性信息；\n• 风险优先级和风险管理过程的所有权分配；\n• 风险评估过程的描述和结果；\n• 适用时：\n  – 制定和实施的缓解/控制措施；\n  – 与监控风险缓解/控制措施有效性相关的活动和结果。\n• 与风险管理相关的其他信息或活动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5x6y7z8-a9b0-4c3d-2e4f-g5h6i7j8k9l0g5",
    chinese_name: "RNAV",
    english_name: "RNAV",
    definition: "参见：区域导航(Area Navigation (RNAV))。",
    equivalent_terms: "",
    see_also: "Area Navigation (RNAV)",
    see_also_array: ["Area Navigation (RNAV)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6y7z8a9-b0c1-4d4e-3f5g-h6i7j8k9l0m1h6",
    chinese_name: "根本原因",
    english_name: "Root Cause",
    definition: "导致不良情况或状况的因果链中的初始原因；是因果链中可以合理实施纠正措施并期望纠正和防止不良情况或状况再次发生的点。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7z8a9b0-c1d2-4e5f-4g6h-i7j8k9l0m1n2i7",
    chinese_name: "根本原因分析",
    english_name: "Root Cause Analysis",
    definition: "一种侧重于识别不良情况或状况的根本原因的分析方法。\n参见：根本原因(Root Cause)。",
    equivalent_terms: "",
    see_also: "Root Cause",
    see_also_array: ["Root Cause"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8a9b0c1-d2e3-4f6g-5h7i-j8k9l0m1n2o3j8",
    chinese_name: "航路和机场手册",
    english_name: "Route and Airport Manual",
    definition: "运营手册的一个独立手册或一部分，经国家接受，包含每个航段的相关信息，涉及通信设施、导航辅助设备、机场、仪表进近、仪表到达和仪表离港（如适用），以及运营人可能认为必要的或国家可能要求为正确执行飞行操作而需要的其他信息。\n参见：运行手册(Operations Manual)。",
    equivalent_terms: "Route Guide, Airway Manual, Route and Aerodrome Manual",
    see_also: "Operations Manual",
    see_also_array: ["Operations Manual"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9b0c1d2-e3f4-4g7h-6i8j-k9l0m1n2o3p4k9",
    chinese_name: "跑道偏离",
    english_name: "Runway Excursion",
    definition: "飞机在起飞或着陆期间偏离或冲出跑道表面的事件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0c1d2e3-f4g5-4h8i-7j9k-l0m1n2o3p4q5l0",
    chinese_name: "跑道侵入",
    english_name: "Runway Incursion",
    definition: "飞机、车辆或人员错误地出现在指定用于飞机着陆和起飞的机场表面保护区内。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1d2e3f4-g5h6-4i9j-8k0l-m1n2o3p4q5r6m1",
    chinese_name: "跑道状况报告 (RCR)",
    english_name: "Runway Condition Report (RCR)",
    definition: "一份关于跑道表面状况及其对飞机着陆和起飞性能影响的全面标准化报告。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2e3f4g5-h6i7-4j0k-9l1m-n2o3p4q5r6s7n2",
    chinese_name: "跑道视程 (RVR)",
    english_name: "Runway Visual Range (RVR)",
    definition: "以百英尺或米为单位报告的能见度值。与盛行能见度或跑道能见度相比，RVR代表从沿跑道中心线移动的飞机上看到的能见度，而不是从最后进近的飞机上看到的能见度。RVR可以通过沿跑道旁边的透射仪使用电子方法得出，或通过转换报告的能见度得出。\n参见：换算的能见度(Converted Meteorological Visibility)。",
    equivalent_terms: "Runway Visual Value (RVV)",
    see_also: "Converted Meteorological Visibility",
    see_also_array: ["Converted Meteorological Visibility"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3f4g5h6-i7j8-4k2l-5m3n-o3p4q5r6s7t8o3",
    chinese_name: "安全迫降",
    english_name: "Safe Forced Landing",
    definition: "一次不可避免的着陆或水上迫降，对飞机上或地面上的人员没有合理的伤害预期。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4g5h6i7-j8k9-4l3m-6n4o-p4q5r6s7t8u9p4",
    chinese_name: "安全行动小组 (SAG)",
    english_name: "Safety Action Group (SAG)",
    definition: "SMS内的一个高级别战术委员会，由指定的部门经理和一线人员代表组成；接受SRB的战略指导，并处理运营中风险控制措施的实施和有效性。\n参见：安全管理体系(Safety Management System (SMS)), 安全评审委员会(Safety Review Board (SRB))。",
    equivalent_terms: "",
    see_also: "Safety Management System (SMS), Safety Review Board (SRB)",
    see_also_array: ["Safety Management System (SMS)", "Safety Review Board (SRB)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5h6i7j8-k9l0-4m4n-7o5p-q5r6s7t8u9v0q5",
    chinese_name: "安全保证",
    english_name: "Safety Assurance",
    definition: "安全管理体系的一个组成部分，包括以下过程：\n• 安全绩效监控和测量；\n• 变更管理；\n• SMS的持续改进。\n参见：安全管理体系(Safety Management System (SMS))。",
    equivalent_terms: "",
    see_also: "Safety Management System (SMS)",
    see_also_array: ["Safety Management System (SMS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6i7j8k9-l0m1-4n5o-8p6q-r6s7t8u9v0w1r6",
    chinese_name: "安全审计",
    english_name: "Safety Audit",
    definition: "对运营的活动、记录、系统、计划、过程、程序、资源和/或其他要素进行的独立和文件化的检查，以验证运营人/提供商的安全绩效并验证现有风险控制的有效性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7j8k9l0-m1n2-4o6p-9q7r-s7t8u9v0w1x2s7",
    chinese_name: "安全文化",
    english_name: "Safety Culture",
    definition: "组织积极寻求改进、警惕地意识到危险源并利用系统和工具进行持续监控、分析和调查的程度；包括人员和管理层对个人安全责任、对安全系统的信心以及一套文件化的规则和政策的共同承诺。建立和遵守健全的安全实践的最终责任在于组织的管理层。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8k9l0m1-n2o3-4p7q-0r8s-t8u9v0w1x2y3t8",
    chinese_name: "安全数据",
    english_name: "Safety Data",
    definition: "从各种与航空相关的来源收集的一组定义的事实或安全值，用于维护或改善安全。安全数据通常从主动或被动的安全相关活动中收集，例如：\n• 事故或事件调查\n• 安全报告\n• 持续适航报告\n• 运营绩效监控\n• 检查、审计、调查和/或\n• 安全研究和审查。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9l0m1n2-o3p4-4q8r-1s9t-u9v0w1x2y3z4u9",
    chinese_name: "安全带",
    english_name: "Safety Harness",
    definition: "由安全带和肩带组成的座椅束带，系紧后可将人的躯干固定在座位上。为提供更大的上身活动范围，安全带可以独立使用，肩带不系。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0m1n2o3-p4q5-4r9s-2t0u-v0w1x2y3z4a5v0",
    chinese_name: "安全信息",
    english_name: "Safety Information",
    definition: "在特定背景下经过处理、组织或分析以使其对安全管理目的有用的安全数据。\n参见：安全数据(Safety Data)。",
    equivalent_terms: "",
    see_also: "Safety Data",
    see_also_array: ["Safety Data"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1n2o3p4-q5r6-4s0t-3u1v-w1x2y3z4a5b6w1",
    chinese_name: "安全管理体系 (SMS)",
    english_name: "Safety Management System (SMS)",
    definition: "在组织内系统化管理安全的方法，包括必要的组织结构、问责制、政策和程序。至少，一个SMS应：\n• 识别安全危险源；\n• 确保采取必要的补救措施以维持可接受的安全水平；\n• 提供对已达到的安全水平的持续监控和定期评估；以及\n• 旨在持续改进整体安全水平。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2o3p4q5-r6s7-4t1u-4v2w-x2y3z4a5b6c7x2",
    chinese_name: "安全目标",
    english_name: "Safety Objective",
    definition: "在运营人的安全管理体系(SMS)内要实现期望的安全结果的高层次声明。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3p4q5r6-s7t8-4u2v-5w3x-y3z4a5b6c7d8y3",
    chinese_name: "安全（运营）",
    english_name: "Safety (Operational)",
    definition: "通过持续的危险源识别和安全风险管理过程，将人员伤害或财产损失的可能性降低并维持在可接受水平或以下的状态。\n注：ISM和ISSM中使用的术语“安全”指的是可能影响飞机运行的安全和/或安保风险的管理。\n注：GOSM中使用的术语“安全”指的是可能影响飞机或地面运行的安全和/或安保风险的管理。\n参见：航空器运行(Aircraft Operations)。",
    equivalent_terms: "",
    see_also: "Aircraft Operations",
    see_also_array: ["Aircraft Operations"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4q5r6s7-t8u9-4v3w-6x4y-z4a5b6c7d8e9z4",
    chinese_name: "安全绩效指标 (SPI)",
    english_name: "Safety Performance Indicator (SPI)",
    definition: "用于监控和评估安全绩效的基于数据的安全参数；与相关安全目标对齐。\n参见：安全目标(Safety Objective)。",
    equivalent_terms: "",
    see_also: "Safety Objective",
    see_also_array: ["Safety Objective"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5r6s7t8-u9v0-4w4x-7y5z-a5b6c7d8e9f0a5",
    chinese_name: "安全绩效目标 (SPT)",
    english_name: "Safety Performance Target (SPT)",
    definition: "在一个给定时期内要实现的安全绩效指标的计划或预期目标。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6s7t8u9-v0w1-4x5y-8z6a-b6c7d8e9f0g1b6",
    chinese_name: "安全推广",
    english_name: "Safety Promotion",
    definition: "SMS的一个组成部分，为与安全风险管理和安全保证相关的过程提供支持，并定义：\n• 培训和教育；\n• 安全沟通。\n参见：安全保证(Safety Assurance), 安全管理体系(Safety Management System (SMS)), 安全风险管理(Safety Risk Management)。",
    equivalent_terms: "",
    see_also: "Safety Assurance, Safety Management System (SMS), Safety Risk Management",
    see_also_array: ["Safety Assurance", "Safety Management System (SMS)", "Safety Risk Management"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7t8u9v0-w1x2-4y6z-9a7b-c7d8e9f0g1h2c7",
    chinese_name: "安全评审委员会 (SRB)",
    english_name: "Safety Review Board (SRB)",
    definition: "SMS内的一个战略委员会，由高级管理人员组成；处理与运营人政策、资源分配、组织绩效监控相关的高级别安全问题。\n参见：安全管理体系(Safety Management System (SMS)), 安全行动小组(Safety Action Group (SAG))。",
    equivalent_terms: "",
    see_also: "Safety Management System (SMS), Safety Action Group (SAG)",
    see_also_array: ["Safety Management System (SMS)", "Safety Action Group (SAG)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8u9v0w1-x2y3-4z7a-0b8c-d8e9f0g1h2i3d8",
    chinese_name: "安全风险",
    english_name: "Safety Risk",
    definition: "现有危险源的任何不利后果或结果的预计严重性和可能性。预计结果可能是一次事故，但中间的不安全事件或后果可能被确定为最可信的结果。\n参见：危险源（航空器运行）(Hazard (Aircraft Operations)), 安全风险评估(Safety Risk Assessment (SRA))。",
    equivalent_terms: "",
    see_also: "Hazard (Aircraft Operations), Safety Risk Assessment (SRA)",
    see_also_array: ["Hazard (Aircraft Operations)", "Safety Risk Assessment (SRA)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9v0w1x2-y3z4-4a8b-1c9d-e9f0g1h2i3j4e9",
    chinese_name: "安全风险评估 (SRA)",
    english_name: "Safety Risk Assessment (SRA)",
    definition: "通过评估现有危险源的不利后果或结果的潜在严重性和发生可能性来确定安全风险的正式过程。\n参见：安全风险(Safety Risk), 安全风险管理(Safety Risk Management)。",
    equivalent_terms: "",
    see_also: "Safety Risk, Safety Risk Management",
    see_also_array: ["Safety Risk", "Safety Risk Management"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0w1x2y3-z4a5-4b9c-2d0e-f0g1h2i3j4k5f0",
    chinese_name: "安全风险管理 (SRM)",
    english_name: "Safety Risk Management (SRM)",
    definition: "安全管理体系的一个组成部分，包括在整个组织范围内实施危险源识别和安全风险评估过程，以确保安全风险得到缓解或控制到可接受的水平。\n参见：危险源（航空器运行）(Hazard (Aircraft Operations)), 安全管理体系(Safety Management System (SMS)), 安全风险评估(Safety Risk Assessment (SRA))。",
    equivalent_terms: "",
    see_also: "Hazard (Aircraft Operations), Safety Management System (SMS), Safety Risk Assessment (SRA)",
    see_also_array: ["Hazard (Aircraft Operations)", "Safety Management System (SMS)", "Safety Risk Assessment (SRA)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g1x2y3z4-a5b6-4c0d-3e1f-g1h2i3j4k5l6g1",
    chinese_name: "安全风险缓解",
    english_name: "Safety Risk Mitigation",
    definition: "制定和实施旨在将安全风险降低并维持在或低于可接受水平的行动或措施，符合组织的安全风险容忍度。\n参见：安全风险(Safety Risk), 安全风险管理(Safety Risk Management), 安全风险容忍度(Safety Risk Tolerability)。",
    equivalent_terms: "Safety Risk Control, Safety Risk Reduction, Safety Risk Tolerability",
    see_also: "Safety Risk, Safety Risk Management, Safety Risk Tolerability",
    see_also_array: ["Safety Risk", "Safety Risk Management", "Safety Risk Tolerability"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h2y3z4a5-b6c7-4d1e-4f2g-h2i3j4k5l6m7h2",
    chinese_name: "安全风险容忍度",
    english_name: "Safety Risk Tolerability",
    definition: "根据组织的风险接受标准，组织可接受（或不可接受）的安全风险水平。\n参见：安全风险(Safety Risk), 安全风险管理(Safety Risk Management)。",
    equivalent_terms: "Safety Risk Acceptability, Safety Risk Appetite",
    see_also: "Safety Risk, Safety Risk Management",
    see_also_array: ["Safety Risk", "Safety Risk Management"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i3z4a5b6-c7d8-4e2f-5g3h-i3j4k5l6m7n8i3",
    chinese_name: "取样",
    english_name: "Sampling",
    definition: "选择合适且通常具有代表性的样本（子集/证据）数量的过程或技术，旨在确定总体（集合/范围）的特征，并达到可接受的置信水平，以评估一项规定的实施情况。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j4a5b6c7-d8e9-4f3g-6h4i-j4k5l6m7n8o9j4",
    chinese_name: "安检",
    english_name: "Screening",
    definition: "应用技术或其他旨在识别和/或检测可能用于实施非法干扰行为的武器、爆炸物或其他危险装置、物品或物质的手段。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k5b6c7d8-e9f0-4g4h-7i5j-k5l6m7n8o9p0k5",
    chinese_name: "水上飞机",
    english_name: "Seaplane",
    definition: "一种设计用于从水上起飞和降落的飞机；可能带有浮筒或设计用于漂浮在水上的主船体（例如飞艇）；水上飞机可以是两栖的（即在陆地或水上运行）或非两栖的（即仅在水上运行）。",
    equivalent_terms: "Amphibious Aircraft, Float Plane",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l6c7d8e9-f0g1-4h5i-8j6k-l6m7n8o9p0q1l6",
    chinese_name: "副驾驶 (SIC)",
    english_name: "Second-in-command (SIC)",
    definition: "一名持有执照并具备资格的飞行员，协助或接替机长，但不包括仅为接受飞行指导而在飞机上的飞行员。",
    equivalent_terms: "Co-pilot, First Officer",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m7d8e9f0-g1h2-4i6j-9k7l-m7n8o9p0q1r2m7",
    chinese_name: "安全货物",
    english_name: "Secure Cargo",
    definition: "经受监管代理人使用适当的安检方法进行安检，或源自经适当当局批准的已知托运人，并在安全供应链的保管下，直至装上飞机以及此后在中转和过境点受到保护免受非法干扰的货物。",
    equivalent_terms: "Known cargo",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n8e9f0g1-h2i3-4j7k-0l8m-n8o9p0q1r2s3n8",
    chinese_name: "安全供应链",
    english_name: "Secure Supply Chain",
    definition: "应用于货物托运的相互关联的安保程序，以维持该托运从进行安检或其他安保控制的点开始，直到到达其最终到达机场，包括通过中转和/或转运点的完整性。",
    equivalent_terms: "Supply chain security",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o9f0g1h2-i3j4-4k8l-1m9n-o9p0q1r2s3t4o9",
    chinese_name: "安保（航空）",
    english_name: "Security (Aviation)",
    definition: "通过人力和物力资源的结合，保障民用航空免受非法干扰行为。\n注：在ISM和GOSM中使用的术语“安保”指的是防范可能影响飞机运行的非法干扰行为。\n参见：航空器运行(Aircraft Operations)。",
    equivalent_terms: "",
    see_also: "Aircraft Operations",
    see_also_array: ["Aircraft Operations"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p0g1h2i3-j4k5-4l9m-2n0o-p0q1r2s3t4u5p0",
    chinese_name: "安保审计",
    english_name: "Security Audit",
    definition: "对国家民航安保计划实施的所有方面进行的深入合规性检查。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q1h2i3j4-k5l6-4m0n-3o1p-q1r2s3t4u5v6q1",
    chinese_name: "安保控制",
    english_name: "Security Control",
    definition: "一种可以防止引入可能用于实施非法干扰行为的武器、爆炸物或其他危险/违禁装置、物品或物质的手段。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r2i3j4k5-l6m7-4n1o-4p2q-r2s3t4u5v6w7r2",
    chinese_name: "安保设备",
    english_name: "Security Equipment",
    definition: "单独或作为系统一部分，用于预防或侦测对民用航空及其设施的非法干扰行为的专业性质的设备。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s3j4k5l6-m7n8-4o2p-5q3r-s3t4u5v6w7x8s3",
    chinese_name: "安保检查",
    english_name: "Security Inspection",
    definition: "对运营人、提供商、机场或其他涉及安保的实体实施相关国家民航安保计划要求的情况进行的检查。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t4k5l6m7-n8o9-4p3q-6r4s-t4u5v6w7x8y9t4",
    chinese_name: "安保管理体系 (SeMS)",
    english_name: "Security Management System (SeMS)",
    definition: "运营人和/或为运营人提供地面处理服务的提供商的文件化系统，基于威胁评估，以确保安保运行：\n• 始终满足适用的国家民航安保计划中规定的所有要求；\n• 在考虑运营环境的情况下，以最有效和最具成本效益的方式进行。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u5l6m7n8-o9p0-4q4r-7s5t-u5v6w7x8y9z0u5",
    chinese_name: "安保手册",
    english_name: "Security Manual",
    definition: "一本手册或一系列相关的独立手册，包含与实施安保计划相关的政策、程序、说明和其他指导，旨在供运营人员在执行其职责时使用。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v6m7n8o9-p0q1-4r5s-8t6u-v6w7x8y9z0a1v6",
    chinese_name: "安保计划",
    english_name: "Security Program",
    definition: "参见：航空运营人安保计划(Air Operator Security Program (AOSP))。",
    equivalent_terms: "",
    see_also: "Air Operator Security Program (AOSP)",
    see_also_array: ["Air Operator Security Program (AOSP)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w7n8o9p0-q1r2-4s6t-9u7v-w7x8y9z0a1b2w7",
    chinese_name: "安保限制区",
    english_name: "Security Restricted Area",
    definition: "机场的空侧区域，被确定为优先风险区域，除门禁控制外，还应用其他安保控制。此类区域通常包括所有商业航空旅客离港区，介于安检点和飞机之间、停机坪、行李分拣区，包括飞机投入使用和已安检的行李和货物所在的区域、货棚、邮件中心、空侧餐饮和飞机清洁场所。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x8o9p0q1-r2s3-4t7u-0v8w-x8y9z0a1b2c3x8",
    chinese_name: "安保隔离区",
    english_name: "Security Sterile Area",
    definition: "机场安保限制区内为旅客提供登机通道的部分，其通道通常通过对人员和财产的安检来控制。\n参见：安保限制区(Security Restricted Area)。",
    equivalent_terms: "Critical Part of Security Restricted Area",
    see_also: "Security Restricted Area",
    see_also_array: ["Security Restricted Area"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y9p0q1r2-s3t4-4u8v-1w9x-y9z0a1b2c3d4y9",
    chinese_name: "安保测试",
    english_name: "Security Test",
    definition: "模拟企图实施非法行为的航空安保措施的秘密或公开试验。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z0q1r2s3-t4u5-4v9w-2x0y-z0a1b2c3d4e5z0",
    chinese_name: "安保威胁",
    english_name: "Security Threat",
    definition: "对民用航空实施非法干扰行为的概率的衡量。\n基础威胁水平–低安保威胁状况，可核实的情报信息未表明任何机场、运营人或为运营人提供地面处理服务的提供商已成为攻击目标；由于民间骚乱、劳资纠纷和/或地方反政府活动，个人或团体可能进行非法干扰。\n中等威胁水平–安保威胁状况，可核实的情报信息表明一个或多个机场、运营人和/或为运营人提供地面处理服务的提供商已成为攻击目标的可能性。\n高威胁水平–安保威胁状况，可核实的情报信息表明一个或多个机场、运营人和/或为运营人提供地面处理服务的提供商已明确成为攻击目标。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1r2s3t4-u5v6-4w0x-3y1z-a1b2c3d4e5f6a1",
    chinese_name: "隔离",
    english_name: "Segregation",
    definition: "必须在飞机和商业部件、材料或消耗品之间以及飞机可用和不可用部件、材料或消耗品之间保持的分离或划分状态。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2s3t4u5-v6w7-4x1y-4z2a-b2c3d4e5f6g7b2",
    chinese_name: "自我评估",
    english_name: "Self-evaluation",
    definition: "一个组织为评估其自身对其内部系统或计划（例如SMS、质量体系、质量保证计划）的遵守情况而应用的持续性计划。",
    equivalent_terms: "Self Audit, Evaluation Program",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3t4u5v6-w7x8-4y2z-5a3b-c3d4e5f6g7h8c3",
    chinese_name: "高级管理层",
    english_name: "Senior Management",
    definition: "组织内具有制定政策、展示承诺、满足要求、批准资源、设定目标、实施流程和实现期望结果的权力和责任的管理层级。",
    equivalent_terms: "Top Management, Leadership",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4u5v6w7-x8y9-4z3a-6b4c-d4e5f6g7h8i9d4",
    chinese_name: "严重事件",
    english_name: "Serious Incident",
    definition: "涉及情况表明事故险些发生的事件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5v6w7x8-y9z0-4a4b-7c5d-e5f6g7h8i9j0e5",
    chinese_name: "重伤",
    english_name: "Serious Injury",
    definition: "一个人在事故中受到的伤害，并且：\n• 需要在收到伤害之日起七天内住院超过48小时，或\n• 导致任何骨骼骨折（手指、脚趾或鼻子的简单骨折除外），或\n• 涉及导致严重出血、神经、肌肉或肌腱损伤的撕裂伤；或\n• 涉及任何内脏器官的损伤，或\n• 涉及二级或三级烧伤，或影响身体表面超过5%的任何烧伤，或\n• 涉及经证实的传染性物质或有害辐射暴露。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6w7x8y9-z0a1-4b5c-8d6e-f6g7h8i9j0k1f6",
    chinese_name: "服务通告 (SB)",
    english_name: "Service Bulletin (SB)",
    definition: "由特定飞机、飞机发动机或飞机部件的制造商发布以详细说明产品改进的文件。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7x8y9z0-a1b2-4c6d-9e7f-g7h8i9j0k1l2g7",
    chinese_name: "服务信息函 (SIL)",
    english_name: "Service Information Letter (SIL)",
    definition: "由飞机、飞机发动机或飞机部件制造商发出的详细说明维修改进计划的信函。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h8y9z0a1-b2c3-4d7e-0f8g-h8i9j0k1l2m3h8",
    chinese_name: "服务水平协议 (SLA)",
    english_name: "Service Level Agreement (SLA)",
    definition: "通常作为合同一部分，在运营人和外部服务提供商之间，或在某些情况下，和内部服务提供商之间签订的正式协议，该协议：\n• 以可衡量的方式规定了外部提供商预期提供的服务；\n• 成为监控外部服务提供商表现的基础。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i9z0a1b2-c3d4-4e8f-1g9h-i9j0k1l2m3n4i9",
    chinese_name: "服务文献",
    english_name: "Service Literature",
    definition: "服务文献包括所有详细说明飞机、发动机、部件和设备改装和/或检查以及需要工程审查的修订的源文件（制造商手册及其修订除外）。它们包括：\n• 服务通告(SB)和来自制造商和供应商的其他文件；\n• 公司工程请求(ER)；\n• 需要考虑维修或改装电缆的信函或其他信息（例如来自供应商的警报信息）；\n• NAA命令和/或法规，详细说明强制性要求；\n• 来自任何其他来源的数据（例如其他航空公司、外国适航当局、制造商所在国、客户）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j0a1b2c3-d4e5-4f9g-2h0i-j0k1l2m3n4o5j0",
    chinese_name: "服务",
    english_name: "Servicing",
    definition: "在飞机、飞机发动机或飞机部件上进行的维修或其他与飞机相关的工作/职能。",
    equivalent_terms: "Maintenance",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k1b2c3d4-e5f6-4g0h-3i1j-k1l2m3n4o5p6k1",
    chinese_name: "货物",
    english_name: "Shipment",
    definition: "由一个托运人在一次和一个地址接受，在一个批次中接收，运往一个目的地地址的一个接收实体的的一件或多件货物。",
    equivalent_terms: "Consignment",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l2c3d4e5-f6g7-4h1i-4j2k-l2m3n4o5p6q7l2",
    chinese_name: "托运人危险品申报单",
    english_name: "Shipper's Declaration for Dangerous Goods",
    definition: "由提供危险品货物运输的人（托运人）签署的规定表格或电子信息；此类声明表明危险品已通过其正确的运输名称得到充分和准确的描述，并且它们已根据相关法规进行分类、包装、标记、标签，并处于适合空运的适当状态。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m3d4e5f6-g7h8-4i2j-5k3l-m3n4o5p6q7r8m3",
    chinese_name: "模拟机",
    english_name: "Simulator",
    definition: "参见：飞行模拟机(Flight Simulator)。",
    equivalent_terms: "",
    see_also: "Flight Simulator",
    see_also_array: ["Flight Simulator"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n4e5f6g7-h8i9-4j3k-6l4m-n4o5p6q7r8s9n4",
    chinese_name: "同时维修",
    english_name: "Simultaneous Maintenance",
    definition: "与EDTO/ER/ETOPS/LROPS相关，由同一人对类似的飞机系统（即磁性屑探测器、发动机）进行的维修。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o5f6g7h8-i9j0-4k4l-7m5n-o5p6q7r8s9t0o5",
    chinese_name: "小型飞机",
    english_name: "Small Aircraft",
    definition: "最大审定起飞重量为5700公斤（12,566磅）或以下的飞机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p6g7h8i9-j0k1-4l5m-8n6o-p6q7r8s9t0u1p6",
    chinese_name: "烟雾隔板",
    english_name: "Smoke Barrier",
    definition: "在飞机上安装在货物与飞行机组、乘客和/或额外人员之间的结构或其他材料，旨在保护这些人员免受可能从货物中散发出的烟雾。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q7h8i9j0-k1l2-4m6n-9o7p-q7r8s9t0u2v3q7",
    chinese_name: "特殊机场",
    english_name: "Special Airports",
    definition: "由运营人或国家指定的机场，由于周围地形、障碍物或复杂的进近或离港程序等因素，需要特殊的飞行机组资格。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r8i9j0k1-l2m3-4n7o-0p8q-r8s9t0u2v3w4r8",
    chinese_name: "特殊安排",
    english_name: "Special Arrangement",
    definition: "经主管当局批准的规定，根据该规定，不满足危险品条例(DGR)所有适用要求的放射性物质运输可以进行。对于此类国际运输，需要多边批准。\n参见：主管当局(Competent Authority), 危险品条例(Dangerous Goods Regulations (DGR))。",
    equivalent_terms: "",
    see_also: "Competent Authority, Dangerous Goods Regulations (DGR)",
    see_also_array: ["Competent Authority", "Dangerous Goods Regulations (DGR)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s9j0k1l2-m3n4-4o8p-1q9r-s9t0u2v3w4x5s9",
    chinese_name: "特殊类别旅客",
    english_name: "Special Category Passengers",
    definition: "需要特别关注、遵守特定指导方针和适当安保程序的旅客。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t0k1l2m3-n4o5-4p9q-2r0s-t0u2v3w4x5y6t0",
    chinese_name: "特殊货物",
    english_name: "Special Cargo",
    definition: "由于其性质或价值，在接收、储存、运输、装载和卸载过程中需要特别关注和处理的任何货物（包括但不限于：危险品、活体动物、易腐品、人类遗骸）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u1l2m3n4-o5p6-4q0r-3s1t-u2v3w4x5y6z7u1",
    chinese_name: "特别许可证（危险品）",
    english_name: "Special Permit (Dangerous Goods)",
    definition: "由美国交通部(DOT)颁发的文件，允许个人执行在美国危险品运输法规下不允许的功能。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v2m3n4o5-p6q7-4r1s-4t2u-v3w4x5y6z7a8v2",
    chinese_name: "特殊目的运行训练 (SPOT)",
    english_name: "Special Purpose Operational Training (SPOT)",
    definition: "在航线运行模拟(LOS)下进行的模拟机训练课程，旨在解决基于技术和CRM要求的特定训练目标。SPOT场景可以包括完整或部分的航段，具体取决于飞行的训练目标。\n参见：航线运行模拟(Line Operational Simulation (LOS))。",
    equivalent_terms: "",
    see_also: "Line Operational Simulation (LOS)",
    see_also_array: ["Line Operational Simulation (LOS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w3n4o5p6-q7r8-4s2t-5u3v-w4x5y6z7a8b9w3",
    chinese_name: "特别批准",
    english_name: "Specific Approval",
    definition: "在商业航空运输运行的运营规范中或在非商业运行的特别批准清单中文件化的批准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x4o5p6q7-r8s9-4t3u-6v4w-x5y6z7a8b9c0x4",
    chinese_name: "特殊运行",
    english_name: "Specialized Operations",
    definition: "在具有独特特征的地理区域进行的运行，需要使用特殊的设备、程序和/或技术来安全地进行飞行操作。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y5p6q7r8-s9t0-4u4v-7w5x-y6z7a8b9c0d1y5",
    chinese_name: "稳定进近",
    english_name: "Stabilized Approach",
    definition: "在进近过程中，关键飞行参数被控制在规定值范围内，以确保飞机到达跑道上方的位置，以便在接地区域安全着陆。\n参见：稳定进近门(Approach Stabilization Gates), 稳定进近标准(Stabilized Approach Criteria)。",
    equivalent_terms: "Stable Approach",
    see_also: "Approach Stabilization Gates, Stabilized Approach Criteria",
    see_also_array: ["Approach Stabilization Gates", "Stabilized Approach Criteria"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z6q7r8s9-t0u1-4v5w-8x6y-z7a8b9c0d1e2z6",
    chinese_name: "稳定进近标准",
    english_name: "Stabilized Approach Criteria",
    definition: "与关键飞行参数相关的规定值范围，飞机在进近过程中必须保持在该范围内，才能被认为是稳定的进近。稳定进近标准由运营人和/或国家定义，通常提供旨在控制飞机配置、飞行路径轨迹（垂直和横向）、空速、下降率、推力设置和检查单完成的限制。\n参见：稳定进近门(Approach Stabilization Gates), 稳定进近(Stabilized Approach)。",
    equivalent_terms: "Stable Approach Criteria",
    see_also: "Approach Stabilization Gates, Stabilized Approach",
    see_also_array: ["Approach Stabilization Gates", "Stabilized Approach"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a7r8s9t0-u1v2-4w6x-9y7z-a8b9c0d1e2f3a7",
    chinese_name: "标准",
    english_name: "Standard",
    definition: "一项规定，指定了在IOSA/ISSA/ISAGO审计范围内的系统、政策、计划、过程、程序、计划、措施、设施、部件、设备类型或任何其他运营方面，被认为是运营必需的，并且运营人/提供商必须遵守。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b8s9t0u1-v2w3-4x7y-0z8a-b9c0d1e2f3g4b8",
    chinese_name: "标准喊话",
    english_name: "Standard Callout",
    definition: "在操作过程中，机组成员根据程序要求发出的统一的口头声明，用于识别状况、行动、仪表设置、开关位置、目视情况或其他程序规定的操作项目。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c9t0u1v2-w3x4-4y8z-1a9b-c0d1e2f3g4h5c9",
    chinese_name: "标准件",
    english_name: "Standard Part",
    definition: "完全符合已建立的政府或行业接受的规范制造的飞机零件，该规范包括设计、制造和统一的识别要求。该规范必须包含生产和确认该零件所需的所有信息。该规范必须公开发布，以便任何一方都可以制造该零件。示例包括但不限于：\n• 国家航空航天标准(NAS)；\n• 空军-海军航空标准(AN)；\n• 汽车工程师学会(SAE)；\n• 航空航天标准(AS)；\n• 军事标准(MS)。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d0u1v2w3-x4y5-4z9a-2b0c-d1e2f3g4h5i6d0",
    chinese_name: "国家",
    english_name: "State",
    definition: "拥有对构成一个民族或国家的领土和人口拥有主权的政府。\n注：在ISM和GOSM中使用的术语“国家”是一个特定术语，意指运营人所在国或提供商运营所在国。\n参见：运营人所在国(State of the Operator)。\n注：在ISM和GOSM中使用的术语“国家”是一个通用术语，意指任何相关的国家。",
    equivalent_terms: "",
    see_also: "State of the Operator",
    see_also_array: ["State of the Operator"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e1v2w3x4-y5z6-4a0b-3c1d-e2f3g4h5i6j7e1",
    chinese_name: "国家接受",
    english_name: "State Acceptance",
    definition: "一个国家处理提交其审查的事项的方法，其回应不是正式的或必然是主动的。如果一个国家在提交后的一段规定时间内没有明确拒绝审查事项的全部或部分，那么该国家可以接受该事项，认为其符合适用标准。如果没有接受的方法，或者一个国家对特定事项不需要接受，则该事项的国家接受被认为是默示的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f2w3x4y5-z6a7-4b1c-4d2e-f3g4h5i6j7k8f2",
    chinese_name: "国家批准",
    english_name: "State Approval",
    definition: "一个国家处理提交其审查的事项的方法，其回应是主动和正式的，构成对符合适用标准的认定或确定。批准将通过批准官员的签名、文件的签发或证书，或相关国家采取的其他正式行动来证明。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g3x4y5z6-a7b8-4c2d-5e3f-g4h5i6j7k8l9g3",
    chinese_name: "国家批准机构",
    english_name: "State Approval Authority",
    definition: "在一个国家或地区内负责签发国家批准文件或证书的机构。\n参见：国家批准(State Approval)。",
    equivalent_terms: "Authority, National Aviation Authority",
    see_also: "State Approval",
    see_also_array: ["State Approval"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h4y5z6a7-b8c9-4d3e-6f4g-h5i6j7k8l9m0h4",
    chinese_name: "航班到达国",
    english_name: "State of Flight Arrival",
    definition: "商业航班到达的国家的领土。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i5z6a7b8-c9d0-4e4f-7g5h-i6j7k8l9m0n1i5",
    chinese_name: "航班离港国",
    english_name: "State of Flight Departure",
    definition: "商业航班从其领土离港的国家的领土。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j6a7b8c9-d0e1-4f5g-8h6i-j7k8l9m0n1o2j6",
    chinese_name: "设计国",
    english_name: "State of Design",
    definition: "对负责飞机型号设计的组织拥有管辖权的国家。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k7b8c9d0-e1f2-4g6h-9i7j-k8l9m0n1o2p3k7",
    chinese_name: "目的地国",
    english_name: "State of Destination",
    definition: "货物运输最终从飞机上卸下的国家的领土。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l8c9d0e1-f2g3-4h7i-0j8k-l9m0n1o2p3q4l8",
    chinese_name: "制造国",
    english_name: "State of Manufacture",
    definition: "对负责飞机最终组装的组织拥有管辖权的国家。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m9d0e1f2-g3h4-4i8j-1k9l-m0n1o2p3q4r5m9",
    chinese_name: "始发国",
    english_name: "State of Origin",
    definition: "货物运输首次装上飞机的国家的领土。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n0e1f2g3-h4i5-4j9k-2l0m-n1o2p3q4r5s6n0",
    chinese_name: "注册国",
    english_name: "State of Registry",
    definition: "飞机在其登记册上登记的国家。",
    equivalent_terms: "Country of Registry",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o1f2g3h4-i5j6-4k0l-3m1n-o2p3q4r5s6t7o1",
    chinese_name: "运营人所在国",
    english_name: "State of the Operator",
    definition: "运营人主要营业地所在的国家，或者如果没有这样的营业地，则是运营人的永久居住地。\n注：在ISM和GOSM中，术语“国家”与“运营人所在国”具有相同的含义。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p2g3h4i5-j6k7-4l1m-4n2o-p3q4r5s6t7u8p2",
    chinese_name: "国家安全计划 (SSP)",
    english_name: "State Safety Program (SSP)",
    definition: "由一个国家为管理民航安全而建立的一套综合性法规和活动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q3h4i5j6-k7l8-4m2n-5o3p-q4r5s6t7u8v9q3",
    chinese_name: "站点",
    english_name: "Station",
    definition: "运营人通常进行飞机运行的机场，或提供商为一个或多个客户航空公司进行地面运行的机场。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r4i5j6k7-l8m9-4n3o-6p4q-r5s6t7u8v9w0r4",
    chinese_name: "站点审计",
    english_name: "Station Audit",
    definition: "在ISAGO下进行的审计，评估地面服务提供商（GSP）在ISAGO范围内进行的地面运行的企业和地方管理流程和程序的实施情况。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s5j6k7l8-m9n0-4o4p-7q5r-s6t7u8v9w0x1s5",
    chinese_name: "隔离区",
    english_name: "Sterile Area",
    definition: "任何旅客检查或安检站与飞机之间的区域，其进入受到严格控制。\n注：在某些国家，隔离区和安保限制区是相同的；在其他国家，存在不同级别的安保。",
    equivalent_terms: "Security Restricted Area",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t6k7l8m9-n0o1-4p5q-8r6s-t7u8v9w0x1y2t6",
    chinese_name: "无菌驾驶舱",
    english_name: "Sterile Flight Deck",
    definition: "在飞行的关键阶段，驾驶舱的运行状态，禁止飞行机组执行任何：\n• 除了安全操作飞机所需的职责之外的职责；\n• 可能分散任何飞行机组成员履行其职责的活动，或可能以任何方式干扰这些职责的正常执行的活动。\n参见：飞行的关键阶段(Critical Phases of Flight)。",
    equivalent_terms: "Sterile Cockpit, Silent Cockpit",
    see_also: "Critical Phases of Flight",
    see_also_array: ["Critical Phases of Flight"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u7l8m9n0-o1p2-4q6r-9s7t-u8v9w0x1y2z3u7",
    chinese_name: "分包",
    english_name: "Sub-Contracting",
    definition: "参见：外包(Outsourcing)。",
    equivalent_terms: "",
    see_also: "Outsourcing",
    see_also_array: ["Outsourcing"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v8m9n0o1-p2q3-4r7s-0t8u-v9w0x1y2z3a4v8",
    chinese_name: "不合格表现",
    english_name: "Substandard Performance",
    definition: "组织系统或计划，或个人任务或行动的表现，不符合定义此类系统、计划、任务或行动的标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w9n0o1p2-q3r4-4s8t-1u9v-w0x1y2z3a4b5w9",
    chinese_name: "重大损坏",
    english_name: "Substantial Damage",
    definition: "对飞机的结构强度、性能或飞行特性产生负面影响，并需要对受影响的部件或系统进行重大修理或更换的损坏或结构故障。起落架、轮子、轮胎和襟翼的损坏不包括在内，以及弯曲的空气动力学整流罩、飞机蒙皮的凹痕、飞机蒙皮的小刺穿、螺旋桨叶片的地面损坏或仅一台发动机的损坏也不包括在内。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x0o1p2q3-r4s5-4t9u-2v0w-x1y2z3a4b5c6x0",
    chinese_name: "适用性/适用性标准",
    english_name: "Suitability/Suitability Criteria",
    definition: "在考虑运营的规模、性质和复杂性的情况下，考虑ISARP是否已实施的一组因素。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y1p2q3r4-s5t6-4u0v-3w1x-y2z3a4b5c6d7y1",
    chinese_name: "额外人员",
    english_name: "Supernumerary",
    definition: "除飞行机组外，非客舱机组成员，但在商业或非商业运行中，在货机或客机上，且未被运营人或当局归类为乘客的人员。此类人员通常为以下任何一种：\n• 由运营人指派到航班上，为运营安全所必需，并已通过选拔和强制性培训获得某些（运营人要求的）知识和能力的人员（例如危险品处理员、货物随行人员、保安、客舱烟雾观察/消防人员）。\n• 经运营人和国家授权，为执行其职责而在飞机上的检查员、审计员或观察员（例如民航局飞行运行检查员、IOSA审计员、LOSA观察员）。\n• 由运营人指派到客运航班上，在客舱内进行某些客户服务活动（例如提供饮料、进行客户关系、售票）的人员；未被指派执行任何安全职责。\n• 与运营人有关系，未经当局归类为乘客，并经运营人和国家授权在飞机上的任何其他个人（例如动物管理员、装卸长、快递员、合同协调员，具有运营人要求的知识和能力的个人往返于工作任务，公司员工或家属在货机的额外人员隔间）。\n注：为运营安全所必需而由运营人指派到航班上的额外人员包括在用于运输货物（无乘客）的客机客舱内具备适当资格的烟雾观察/消防人员。\n注：非执勤机组成员、公司员工和员工家属在客运航班上占用乘客座位时，通常为确定ISARPs的适用性，被视为乘客。\n参见：客舱机组(Cabin Crew), 货物随行人员(Cargo Attendant), 飞行机组(Flight Crew), 旅客(Passenger)。",
    equivalent_terms: "",
    see_also: "Cabin Crew, Cargo Attendant, Flight Crew, Passenger",
    see_also_array: ["Cabin Crew", "Cargo Attendant", "Flight Crew", "Passenger"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z2q3r4s5-t6u7-4v1w-4x2y-z3a4b5c6d7e8z2",
    chinese_name: "额外人员隔间",
    english_name: "Supernumerary Compartment",
    definition: "货机上与驾驶舱和货舱分开的隔间，为额外人员（例如动物管理员、货物随行人员、快递员）提供座位。\n参见：全货机(All-cargo Aircraft)。",
    equivalent_terms: "Courier Compartment, Courier Area",
    see_also: "All-cargo Aircraft",
    see_also_array: ["All-cargo Aircraft"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a3r4s5t6-u7v8-4w2x-5y3z-a4b5c6d7e8f9a3",
    chinese_name: "监督下的运行经验 (SOE)",
    english_name: "Supervised Operating Experience (SOE)",
    definition: "机组成员在特定飞机型号上，结合飞行或客舱机组成员资格培训和评估所要求的操作经验。SOE是在运营人和/或国家为此目的授权的现行合格飞行或客舱机组成员监督下进行的航线训练的一种形式。\n参见：航线训练(Line Training)。",
    equivalent_terms: "Initial Operating Experience (IOE), Operating Experience (OE), Transoceanic Operating Experience (TOE)",
    see_also: "Line Training",
    see_also_array: ["Line Training"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b4s5t6u7-v8w9-4x3y-6z4a-b5c6d7e8f9g0b4",
    chinese_name: "补充型号合格证 (STC) 持有人",
    english_name: "Supplemental Type Certificate (STC) Holder",
    definition: "经适用NAA批准修改特定飞机型号的组织。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c5t6u7v8-w9x0-4y4z-7a5b-c6d7e8f9g0h1c5",
    chinese_name: "补充氧气",
    english_name: "Supplemental Oxygen",
    definition: "在飞机上为保护每位乘员免受过高客舱高度的不利影响并维持可接受的生理条件所需的额外氧气。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d6u7v8w9-x0y1-4z5a-8b6c-d7e8f9g0h1i2d6",
    chinese_name: "补充站点程序",
    english_name: "Supplementary Station Procedures",
    definition: "补充站点程序(SSP, ICAO附件17第18次修正案中最近引入的一个新概念)旨在成为特定国家的安保程序，这些程序尚未纳入主AOSP中，以便在第三国运营。在这种情况下，运营人通常会有一个经其注册国批准的AOSP，以及经第三国监管机构批准的若干SSP。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e7v8w9x0-y1z2-4a6b-9c7d-e8f9g0h1i2j3e7",
    chinese_name: "供应商",
    english_name: "Supplier",
    definition: "向航空运输业销售或以其他方式提供产品或服务的组织；可能包括维修、备件和信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f8w9x0y1-z2a3-4b7c-0d8e-f9g0h1i2j3k4f8",
    chinese_name: "剩余（维修）",
    english_name: "Surplus (Maintenance)",
    definition: "描述由军方、制造商、所有者/运营人、修理设施或任何其他零件供应商作为剩余物资放行的产品、组件、零件或材料。这些产品应显示出可追溯至经适用当局批准的制造程序。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g9x0y1z2-a3b4-4c8d-1e9f-g0h1i2j3k4l5g9",
    chinese_name: "监视",
    english_name: "Surveillance",
    definition: "对一个系统或系统与程序的组合进行的持续但间歇性的检查或审计。",
    equivalent_terms: "Continuous Surveillance",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h0y1z2a3-b4c5-4d9e-2f0g-h1i2j3k4l5m6h0",
    chinese_name: "系统",
    english_name: "System",
    definition: "• 组织系统–组织内以协调方式运作以实现期望结果的相互作用或相互关联的元素的组合。\n• 技术系统–硬件（例如机器、部件）和/或软件的组合或网络，作为一个单元运作以产生定义的输出。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i1z2a3b4-c5d6-4e0f-3g1h-i2j3k4l5m6n7i1",
    chinese_name: "非共享责任制（运行控制）",
    english_name: "System of Non-shared Responsibility (Operational Control)",
    definition: "一种PIC对运行控制的所有方面负有唯一责任，并由飞行签派员/飞行运行官员(FOO)或其他运营控制人员协助和/或支持的系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j2a3b4c5-d6e7-4f1g-4h2i-j3k4l5m6n7o8j2",
    chinese_name: "共享责任制（运行控制）",
    english_name: "System of Shared Responsibility (Operational Control)",
    definition: "一种机长和飞行签派员/飞行运行官员(FOO)对运行控制的所有方面共同负责的系统。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k3b4c5d6-e7f8-4g2h-5i3j-k4l5m6n7o8p9k3",
    chinese_name: "目标豁免 (TEs)",
    english_name: "Targeted Exemptions (TEs)",
    definition: "因COVID-19大流行而授予的，对特定标准子集的范围严密且有时限的国家发布的豁免。TEs不应为应对系统性问题而授予。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l4c5d6e7-f8g9-4h3i-6j4k-l5m6n7o8p9q0l4",
    chinese_name: "任务",
    english_name: "Task",
    definition: "在遵循程序时完成的活动。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m5d6e7f8-g9h0-4i4j-7k5l-m6n7o8p9q0r1m5",
    chinese_name: "任务卡",
    english_name: "Task Card",
    definition: "指定由任命授权人批准的所有维修或车间任务或行动的文件或其他媒介，作为维修系统的一部分。任务卡是计算机或手动制作的签收单或卡，包括但不限于；工卡；检查单中的任务；调查表；维修例行程序；工作单；工作指令；改装卡；计划整改卡；批准的修理方案；操作单。\n它们可能详细说明所有要求，或可能引用特定手册或文件中的放大细节。它们用于发布技术指令，并要求对该任务的完成进行认证。任务卡可以是永久性或检查性任务，可以在基地、车间或航线维修地点制作，用于检查、改装或部件更换。",
    equivalent_terms: "Job Card, Work Card",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n6e7f8g9-h0i1-4j5k-8l6m-n7o8p9q0r1s2n6",
    chinese_name: "滑行通道",
    english_name: "Taxi Channel",
    definition: "水上机场上为滑行水上飞机使用的规定路径。\n参见：水上机场(Water Aerodrome)。",
    equivalent_terms: "",
    see_also: "Water Aerodrome",
    see_also_array: ["Water Aerodrome"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o7f8g9h0-i1j2-4k6l-9m7n-o8p9q0r1s2t3o7",
    chinese_name: "技术说明",
    english_name: "Technical Instructions",
    definition: "根据ICAO理事会建立的程序批准并定期发布的《危险品安全空运技术说明》（文件9284）。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p8g9h0i1-j2k3-4l7m-0n8o-p9q0r1s2t3u4p8",
    chinese_name: "技术日志",
    english_name: "Technical Log",
    definition: "参见：航空器技术日志(Aircraft Technical Log (ATL))。",
    equivalent_terms: "",
    see_also: "Aircraft Technical Log (ATL)",
    see_also_array: ["Aircraft Technical Log (ATL)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q9h0i1j2-k3l4-4m8n-1o9p-q0r1s2t3u4v5q9",
    chinese_name: "温控条例 (TCR)",
    english_name: "Temperature Control Regulations (TCR)",
    definition: "由IATA发布的综合指南，旨在使参与时间和温度敏感产品运输和处理的利益相关者能够安全地满足所有适用要求。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r0i1j2k3-l4m5-4n9o-2p0q-r1s2t3u4v5w6r0",
    chinese_name: "临时修订",
    english_name: "Temporary Revision",
    definition: "对IOSA/ISAGO/ISSA手册的增补或修改，在被纳入正式修订之前，临时成为该手册的一部分。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s1j2k3l4-m5n6-4o0p-3q1r-s2t3u4v5w6x7s1",
    chinese_name: "TERPS（终端仪表程序）",
    english_name: "TERPS (Terminal Instrument Procedures)",
    definition: "美国联邦航空管理局(FAA)为通过应用运行规则和终端仪表程序来清除空域以进行飞机运行的程序。\n参见：PANS-OPS(PANS-OPS)。",
    equivalent_terms: "",
    see_also: "PANS-OPS",
    see_also_array: ["PANS-OPS"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t2k3l4m5-n6o7-4p1q-4r2s-t3u4v5w6x7y8t2",
    chinese_name: "地形感知和警告系统 (TAWS)",
    english_name: "Terrain Awareness and Warning System (TAWS)",
    definition: "参见：具有前视地形规避功能的近地警告系统(Ground Proximity Warning System (GPWS) with a Forward Looking Terrain Avoidance Function)。",
    equivalent_terms: "",
    see_also: "Ground Proximity Warning System (GPWS) with a Forward Looking Terrain Avoidance Function",
    see_also_array: ["Ground Proximity Warning System (GPWS) with a Forward Looking Terrain Avoidance Function"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u3l4m5n6-o7p8-4q2r-5s3t-u4v5w6x7y8z9u3",
    chinese_name: "威胁",
    english_name: "Threat",
    definition: "超出飞行机组影响范围的事件或差错，增加了运营复杂性，必须加以管理以维持安全裕度。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v4m5n6o7-p8q9-4r3s-6t4u-v5w6x7y8z9a0v4",
    chinese_name: "威胁管理",
    english_name: "Threat Management",
    definition: "通过减少或消除威胁后果并降低差错或不良飞机状态概率的对策来发现和应对威胁的过程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w5n6o7p8-q9r0-4s4t-7u5v-w6x7y8z9a0b1w5",
    chinese_name: "威胁与差错管理 (TEM)",
    english_name: "Threat and Error Management (TEM)",
    definition: "飞行机组为发现和应对威胁而采取的行动，以及减少或消除潜在后果并降低差错或不良飞机状态概率的对策。\n威胁–超出飞行机组影响范围的事件或差错，增加了运营复杂性，需要管理以维持可接受的安全裕度。\n差错–偏离正确路线或标准；不规律；错误；不准确；做错或遗漏的事情。驾驶舱内的差错通常与沟通、程序、飞行机组成员熟练度和/或决策有关。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x6o7p8q9-r0s1-4t5u-8v6w-x7y8z9a0b1c2x6",
    chinese_name: "阈值时间",
    english_name: "Threshold Time",
    definition: "由国家规定并以时间表示的到航路备降机场的航程，任何导致超过该时间的运行都需要国家对EDTO (ETOPS)的特别批准。\n参见：特别批准(Specific Approval)。",
    equivalent_terms: "",
    see_also: "Specific Approval",
    see_also_array: ["Specific Approval"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y7p8q9r0-s1t2-4u6v-9w7x-y8z9a0b1c2d3y7",
    chinese_name: "工具和校准系统",
    english_name: "Tooling and Calibration System",
    definition: "一个记录在飞机、飞机发动机和飞机部件维修期间使用的校准工具和设备的持有和校准详情的系统。",
    equivalent_terms: "Tooling and Equipment System, Calibrated Tooling System",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z8q9r0s1-t2u3-4v7w-0x8y-z9a0b1c2d3e4z8",
    chinese_name: "可追溯性",
    english_name: "Traceability",
    definition: "通过文件或电子方式，通过任务编号、检查参考编号或序列号等方式，追踪维修、零件、过程和材料至执行或认证维修的人员、原始制造商或其他来源的能力。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a9r0s1t2-u3v4-4w8x-1y9z-a0b1c2d3e4f5a9",
    chinese_name: "交通防撞系统 (TCAS)",
    english_name: "Traffic Collision Avoidance System (TCAS)",
    definition: "参见：机载防撞系统(Airborne Collision Avoidance System (ACAS))。",
    equivalent_terms: "",
    see_also: "Airborne Collision Avoidance System (ACAS)",
    see_also_array: ["Airborne Collision Avoidance System (ACAS)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b0s1t2u3-v4w5-4x9y-2z0a-b1c2d3e4f5g6b0",
    chinese_name: "培训",
    english_name: "Training",
    definition: "向具有运营职责的人员提供的正式指导，以确保每个人都具备满足工作职责和履行指派职责所需的意识、知识和能力。培训还可能包括测试、检查、评估或评价活动，作为展示熟练度或能力的方式。\n附加培训–在基于运营结果、绩效评估、质量审计、监管变更或标准或程序变更认为必要时提供的培训。\n基础熟悉培训–由运营人向新雇用的机组成员提供的地面培训，以确保熟悉：\n• 飞行和客舱机组成员的职责和责任（如适用）；\n• 相关国家法规；\n• 授权的运营（对客舱机组成员不要求）；\n• OM的相关章节。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c1t2u3v4-w5x6-4y0z-3a1b-c2d3e4f5g6h7c1",
    chinese_name: "差异培训",
    english_name: "Differences Training",
    definition: "为目前在某一飞机上合格的飞行或客舱机组成员提供的培训，他们将在同一飞机型号的另一变型上，或在同一飞机级别的另一型号上担任相同职位，国家已确定基本的飞机相似性仅需熟悉变型或型号之间的差异，而无需完成新飞机的完整过渡培训课程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d2u3v4w5-x6y7-4z1a-4b2c-d3e4f5g6h7i8d2",
    chinese_name: "初始培训",
    english_name: "Initial Training",
    definition: "在被指派新职责、职能、职位和/或飞机之前，向具有运营职责的人员提供的正式培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e3v4w5x6-y7z8-4a2b-5c3d-e4f5g6h7i8j9e3",
    chinese_name: "复训",
    english_name: "Recurrent Training",
    definition: "根据国家、运营人和/或服务提供商的要求（如适用），按一定频率向运营和维修人员提供的持续培训。",
    equivalent_terms: "Refresher Training, Continuation Training",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f4w5x6y7-z8a9-4b3c-6d4e-f5g6h7i8j9k0f4",
    chinese_name: "重新资格培训",
    english_name: "Re-qualification Training",
    definition: "为曾接受过培训并有资格执行某些职责或职能，但后来变得不合格的运营职责人员所需的培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g5x6y7z8-a9b0-4c4d-7e5f-g6h7i8j9k0l1g5",
    chinese_name: "过渡培训",
    english_name: "Transition Training",
    definition: "为更换到另一飞机型号或级别并在同一组别的另一架飞机上担任相同职位的飞行和客舱机组成员提供的培训。对于在共享运营控制系统下熟悉新飞机型号的飞行运行官员/飞行签派员，也可能需要过渡培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h6y7z8a9-b0c1-4d5e-8f6g-h7i8j9k0l1m2h6",
    chinese_name: "型号等级培训",
    english_name: "Type Rating Training",
    definition: "为飞行机组成员满足颁发需要新型号或类别等级的飞机型号或类别的飞行机组执照的适用要求的培训。",
    equivalent_terms: "Conversion Training",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i7z8a9b0-c1d2-4e6f-9g7h-i8j9k0l1m2n3i7",
    chinese_name: "更新培训",
    english_name: "Update Training",
    definition: "为确保人员保持胜任并了解职责或责任领域的任何变化而提供的培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j8a9b0c1-d2e3-4f7g-0h8i-j9k0l1m2n3o4j8",
    chinese_name: "升级培训",
    english_name: "Upgrade Training",
    definition: "在被指派到具有更高权威和责任级别的新职责或职能之前，为运营或维修人员（特别是飞行机组成员）提供的培训。\n参见：达到熟练的培训(Training to Proficiency)。",
    equivalent_terms: "",
    see_also: "Training to Proficiency",
    see_also_array: ["Training to Proficiency"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k9b0c1d2-e3f4-4g8h-1i9j-k0l1m2n3o4p5k9",
    chinese_name: "培训课程",
    english_name: "Training Course",
    definition: "为实现特定培训目标而进行的一系列课程、讲座或会议。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l0c1d2e3-f4g5-4h9i-2j0k-l1m2n3o4p5q6l0",
    chinese_name: "培训大纲",
    english_name: "Training Curriculum",
    definition: "由进行培训的组织提供的有组织的学习计划或课程。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m1d2e3f4-g5h6-4i0j-3k1l-m2n3o4p5q6r7m1",
    chinese_name: "培训手册",
    english_name: "Training Manual",
    definition: "运营手册的一个独立手册或一部分，经国家接受，包含运营人员培训计划的相关细节。\n参见：运行手册(Operations Manual (OM))。",
    equivalent_terms: "",
    see_also: "Operations Manual (OM)",
    see_also_array: ["Operations Manual (OM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n2e3f4g5-h6i7-4j1k-4l2m-n3o4p5q6r7s8n2",
    chinese_name: "训练飞行",
    english_name: "Training Flight",
    definition: "在没有乘客或货物的情况下，在运营人和/或国家为此目的授权的教员或评估员监督下，在飞机上进行的训练运行。训练飞行通常是由于缺乏经批准用于根据运营人的训练计划建立或维持飞行机组成员资格的代表性飞行模拟机而进行的。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o3f4g5h6-i7j8-4k2l-5m3n-o4p5q6r7s8t9o3",
    chinese_name: "训练大纲",
    english_name: "Training Syllabus",
    definition: "一份学术文件，提供关于特定训练课程的详细信息；描述课程要求、评分标准、课程内容、培训师期望、截止日期、考试要求、评分政策和其他相关课程信息。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p4g5h6i7-j8k9-4l3m-6n4o-p5q6r7s8t9u0p4",
    chinese_name: "达到熟练的培训",
    english_name: "Training-to-Proficiency",
    definition: "一种训练和评估方法，当评估员确定一个事件或机动不令人满意时采用，随后进行训练并重复该事件或机动的评估测试；被确定为不令人满意的事件或机动必须被记录。这种训练规定通常是为了公平起见，避免给飞行员和运营人带来不必要的困难和费用而提供的。然而，训练的进行不能不记录这些事件的失败。达到熟练的培训通常包含以下要素：\n• 训练和检查不同时进行。当需要训练时，评估暂停，进行训练，然后恢复检查；\n• 当需要达到熟练的培训时，评估员记录最初失败的事件和进行了训练的事件；\n• 当达到熟练的培训进行并且检查随后在原始训练和评估会话中完成时，检查的总体成绩可以记录为满意；\n• 当达到熟练所需的训练无法在原始检查会话中完成时，检查记录为不满意，机组成员进入重新资格培训。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q5h6i7j8-k9l0-4m4n-7o5p-q6r7s8t9u0v1q5",
    chinese_name: "中转货物和邮件",
    english_name: "Transfer Cargo and Mail",
    definition: "在非其到达航班的飞机上离港的货物和邮件运输。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r6i7j8k9-l0m1-4n5o-8p6q-r7s8t9u0v1w2r6",
    chinese_name: "透射仪",
    english_name: "Transmissometer",
    definition: "一种通常由投影仪和接收器组成的仪器，通过测量光在大气中的透射来确定能见度；它是确定跑道视程(RVR)和跑道能见度值(RVV)的测量源。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s7j8k9l0-m1n2-4o6p-9q7r-s8t9u0v1w2x3s7",
    chinese_name: "中转行李",
    english_name: "Transfer Baggage",
    definition: "已在航班上运输到某个地点，然后在规定的时间段内卸下并转移到另一航班以运输到另一地点的行李。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t8k9l0m1-n2o3-4p7q-0r8s-t9u0v1w2x3y4t8",
    chinese_name: "运输指数 (TI)",
    english_name: "Transportation Index (TI)",
    definition: "仅适用于放射性物质；分配给包装、外包装或货运集装箱的单个数字，以提供对辐射暴露的控制。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u9l0m1n2-o3p4-4q8r-1s9t-u0v1w2x3y4z5u9",
    chinese_name: "涡轮动力飞机",
    english_name: "Turbine Powered Aircraft",
    definition: "由内燃机驱动的飞机，该内燃机由空气压缩机、燃烧室和由燃烧产物膨胀驱动的涡轮组成。\n注：ISM中使用的术语“涡轮动力飞机”包括涡扇、涡喷和涡桨飞机，但不包括通常用于驱动旋翼飞机的涡轴发动机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v0m1n2o3-p4q5-4r9s-2t0u-v1w2x3y4z5a6v0",
    chinese_name: "型号合格证",
    english_name: "Type Certificate",
    definition: "由ICAO成员国颁发的文件，用于定义飞机型号的设计并证明该设计符合该国的相应适航要求。",
    equivalent_terms: "Aircraft Type Certificate",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w1n2o3p4-q5r6-4s0t-3u1v-w2x3y4z5a6b7w1",
    chinese_name: "型号合格证持有人",
    english_name: "Type Certificate Holder",
    definition: "经适用NAA批准设计、制造、测试和生产特定飞机型号的组织。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x2o3p4q5-r6s7-4t1u-4v2w-x3y4z5a6b7c8x2",
    chinese_name: "型号设计",
    english_name: "Type Design",
    definition: "特定飞机型号和部件的设计，包括：\n• 定义产品配置和设计特征以证明符合适用的型号合格审定基础和环境保护要求的图纸和规格，以及这些图纸和规格的清单；\n• 确保产品符合性所需的材料和工艺以及制造和组装方法的信息；\n• 经批准的适航限制部分，如适用的适航规范所定义；\n• 任何其他必要的数据，以便通过比较确定同类型后续产品的适航性、噪音、燃油排放和排气排放（如适用）的特性。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y3p4q5r6-s7t8-4u2v-5w3x-y4z5a6b7c8d9y3",
    chinese_name: "型号设计组织",
    english_name: "Type Design Organization",
    definition: "经NAA批准设计特定飞机型号的组织。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z4q5r6s7-t8u9-4v3w-6x4y-z5a6b7c8d9e0z4",
    chinese_name: "集装单元条例 (ULDR)",
    english_name: "Unit Load Device Regulations (ULDR)",
    definition: "由IATA发布的一份文件（手册），提供适用于整体ULD操作的技术和操作标准规范、法规要求和航空公司要求。\n参见：航空器集装单元(Aircraft Unit Load Device)。",
    equivalent_terms: "",
    see_also: "Aircraft Unit Load Device",
    see_also_array: ["Aircraft Unit Load Device"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a5r6s7t8-u9v0-4w4x-7y5z-a6b7c8d9e0f1a5",
    chinese_name: "无人陪伴行李",
    english_name: "Unaccompanied Baggage",
    definition: "已装载到飞机上但其所有者/乘客不在该飞机上的托运行李。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b6s7t8u9-v0w1-4x5y-8z6a-b7c8d9e0f1g2b6",
    chinese_name: "无人陪伴未成年人",
    english_name: "Unaccompanied Minor",
    definition: "通常指年龄在十二岁以下，没有父母或监护人陪同旅行的儿童。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c7t8u9v0-w1x2-4y6z-9a7b-c8d9e0f1g2h3c7",
    chinese_name: "不适航",
    english_name: "Un-airworthy",
    definition: "飞机的一种状况，使其不能被批准放行并飞行。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d8u9v0w1-x2y3-4z7a-0b8c-d9e0f1g2h3i4d8",
    chinese_name: "未经授权的干扰",
    english_name: "Unauthorized Interference",
    definition: "当发生以下情况时的干扰：\n• 运营人已接受运输并经过安保控制的任何待运物品（例如行李、货物、邮件、物料、餐饮设备）随后与未经安检和/或无权进入存放此类物品的安保限制/隔离区的人员接触。\n• 未经安检和/或无权进入安保限制/隔离区的人员未经授权进入乘客、飞机和/或运营人的财产所在的区域。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e9v0w1x2-y3z4-4a8b-1c9d-e0f1g2h3i4j5e9",
    chinese_name: "无人认领行李",
    english_name: "Unclaimed Baggage",
    definition: "到达机场的航班上的行李，但未被乘客或机组成员领取或认领。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f0w1x2y3-z4a5-4b9c-2d0e-f1g2h3i4j5k6f0",
    chinese_name: "水下定位信标/装置 (ULB/ULD)",
    english_name: "Underwater Locator Beacon/Device (ULB/ULD)",
    definition: "安装在飞机飞行记录器（例如驾驶舱话音记录器、飞行数据记录器）上或直接固定在飞机机身上的装置。此类装置设计用于：\n• 浸入水中时激活，\n• 在指定频率上运行指定时间，并且\n• 在事故撞击后存活并正常工作。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g1x2y3z4-a5b6-4c0d-3e1f-g2h3i4j5k6l7g1",
    chinese_name: "身份不明行李",
    english_name: "Unidentified Baggage",
    definition: "在机场的行李，无论有无行李牌，都未被乘客或机组成员领取或识别。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "h2y3z4a5-b6c7-4d1e-4f2g-h3i4j5k6l7m8h2",
    chinese_name: "集装单元 (ULD)",
    english_name: "Unit Load Device (ULD)",
    definition: "任何类型的货运集装箱、飞机集装箱、带网的飞机托盘或带网覆盖冰屋的飞机托盘。",
    equivalent_terms: "Freight Container (Non-radioactive Materials)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "i3z4a5b6-c7d8-4e2f-5g3h-i4j5k6l7m8n9i3",
    chinese_name: "无人机 (UAV)",
    english_name: "Unmanned Aerial Vehicle (UAV)",
    definition: "没有人类驾驶员在机上的飞机。UAV可以是遥控飞机（例如由地面控制站的驾驶员驾驶）或可以根据预编程的飞行计划或更复杂的动态自动化系统自主飞行。",
    equivalent_terms: "Drone, Remotely-piloted Aircraft (RPA)",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "j4a5b6c7-d8e9-4f3g-6h4i-j5k6l7m8n9o0j4",
    chinese_name: "无人机系统 (UAS)",
    english_name: "Unmanned Aircraft Systems (UAS)",
    definition: "一架无人遥控飞机、其相关的远程驾驶员站、所需的指挥和控制链路以及型号设计中指定的任何其他组件。\n参见：远程驾驶员站(Remote Pilot Station)。",
    equivalent_terms: "Remotely-piloted Aircraft System (RPAS)",
    see_also: "Remote Pilot Station",
    see_also_array: ["Remote Pilot Station"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "k5b6c7d8-e9f0-4g4h-7i5j-k6l7m8n9o0p1k5",
    chinese_name: "未知货物",
    english_name: "Unknown Cargo",
    definition: "未经适当安保控制（可能包括安检）或在安全供应链的保管下受到非法干扰的货物运输。\n参见：货物(Cargo), 受监管代理人(Regulated Agent), 安全供应链(Secure Supply Chain), 不安全货物(Unsecure Cargo)。",
    equivalent_terms: "",
    see_also: "Cargo, Regulated Agent, Secure Supply Chain, Unsecure Cargo",
    see_also_array: ["Cargo", "Regulated Agent", "Secure Supply Chain", "Unsecure Cargo"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "l6c7d8e9-f0g1-4h5i-8j6k-l7m8n9o0p1q2l6",
    chinese_name: "不安全货物",
    english_name: "Unsecure Cargo",
    definition: "任何未按照“安全货物”要求进行安保的托运货物，即未经受监管代理人适当安检，或未经经适当当局批准的已知托运人进行适当的安保控制，或在从进行安检或其他安保控制的点开始，直到其最后到达点，包括通过中转和转运点的整个安全供应链中未受保护免受非法干扰的货物。",
    equivalent_terms: "Unknown Cargo",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "m7d8e9f0-g1h2-4i6j-9k7l-m8n9o0p1q2r3m7",
    chinese_name: "不遵守纪律的旅客",
    english_name: "Unruly Passenger",
    definition: "参见：扰乱性旅客(Disruptive Passenger)。",
    equivalent_terms: "",
    see_also: "Disruptive Passenger",
    see_also_array: ["Disruptive Passenger"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "n8e9f0g1-h2i3-4j7k-0l8m-n9o0p1q2r3s4n8",
    chinese_name: "不可用",
    english_name: "Unserviceable",
    definition: "飞机、发动机、部件或任何设备处于不允许在运行中使用的状态。",
    equivalent_terms: "Inoperative",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "o9f0g1h2-i3j4-4k8l-1m9n-o0p1q2r3s4t5o9",
    chinese_name: "贵重货物",
    english_name: "Valuable Cargo",
    definition: "包含一件或多件贵重物品（在IATA货物服务会议决议手册，决议012中指定）的货物运输。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "p0g1h2i3-j4k5-4l9m-2n0o-p1q2r3s4t5u6p0",
    chinese_name: "供应商",
    english_name: "Vendor",
    definition: "参见：供应商(Supplier)。",
    equivalent_terms: "",
    see_also: "Supplier",
    see_also_array: ["Supplier"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "q1h2i3j4-k5l6-4m0n-3o1p-q2r3s4t5u6v7q1",
    chinese_name: "验证审计 (VA)",
    english_name: "Verification Audit (VA)",
    definition: "在IOSA/ISAGO计划下进行的审计，以确保分别持续符合ISM/IPM或GOSM/GOPM。验证审计(VA)可能不总是涵盖所有IOSA/ISAGO学科，在运营人的IOSA/ISAGO注册期内进行。VA由SVP、SFO根据IPM/GOPM规定发起。\n参见：审计(Audit), IOSA计划(IOSA Program), IOSA计划手册(IOSA Program Manual (IPM))。",
    equivalent_terms: "",
    see_also: "Audit, IOSA Program, IOSA Program Manual (IPM)",
    see_also_array: ["Audit", "IOSA Program", "IOSA Program Manual (IPM)"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "r2i3j4k5-l6m7-4n1o-4p2q-r3s4t5u6v7w8r2",
    chinese_name: "目视飞行规则 (VFR)",
    english_name: "Visual Flight Rules (VFR)",
    definition: "在允许飞行员看到飞机去向的天气条件下，管辖飞机运行的规则和法规，飞行员负责观察和避开地形、障碍物和其他飞机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "s3j4k5l6-m7n8-4o2p-5q3r-s4t5u6v7w8x9s3",
    chinese_name: "目视检查",
    english_name: "Visual Inspection",
    definition: "直接或借助合适的仪器对一个区域或部件的状态进行的目视检查。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "t4k5l6m7-n8o9-4p3q-6r4s-t5u6v7w8x9y0t4",
    chinese_name: "目视气象条件 (VMC)",
    english_name: "Visual Meteorological Conditions (VMC)",
    definition: "有足够能见度以飞行飞机并与地形和其他飞机保持目视分离的气象条件；以能见度、距云距离和云高表示；等于或优于目视飞行规则下运行的规定最低标准。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "u5l6m7n8-o9p0-4q4r-7s5t-u6v7w8x9y0z1u5",
    chinese_name: "尾流湍流",
    english_name: "Wake Turbulence",
    definition: "飞机通过空气时在其后形成的湍流，由机翼产生升力时形成的涡流引起。",
    equivalent_terms: "Wingtip Vortices, Jet Wash",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "v6m7n8o9-p0q1-4r5s-8t6u-v7w8x9y0z1a2v6",
    chinese_name: "警告信",
    english_name: "Warning Letter",
    definition: "由IATA向审计组织(AO)发出的正式信函，指出需要立即纠正已定义的计划缺陷，否则将面临认证撤销。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "w7n8o9p0-q1r2-4s6t-9u7v-w8x9y0z1a2b3w7",
    chinese_name: "武器",
    english_name: "Weapon",
    definition: "能够并意图用于对生物、结构或系统造成损害或伤害的工具或设备；通常禁止乘客携带上飞机。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "x8o9p0q1-r2s3-4t7u-0v8w-x9y0z1a2b3c4x8",
    chinese_name: "重量和平衡手册 (W&BM)",
    english_name: "Weight and Balance Manual (W&BM)",
    definition: "由制造商为每种飞机型号发布的手册，经适航当局作为飞机型号认证的一部分批准，并定义了运营人在装载飞机时不得超过的一套重量和平衡限制。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "y9p0q1r2-s3t4-4u8v-1w9x-y0z1a2b3c4d5y9",
    chinese_name: "水上演练",
    english_name: "Wet Drill",
    definition: "一种实际训练演习，机组成员进入水中的救生筏，可以从水中爬入救生筏，也可以直接从飞机出口登上救生筏。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "z0q1r2s3-t4u5-4v9w-2x0y-z1a2b3c4d5e6z0",
    chinese_name: "全服务湿租协议",
    english_name: "Wet Lease Agreement",
    definition: "一种商业飞机租赁协议，其中运营人（“承租人”）通过利用外部运营人（“出租人”）的飞机来满足其自身的运营需求；出租人对为承租人进行的运营中的此类飞机行使运营控制权。\n参见：湿租协议(Damp Lease)。",
    equivalent_terms: "ACMI Lease",
    see_also: "Damp Lease",
    see_also_array: ["Damp Lease"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "a1r2s3t4-u5v6-4w0x-3y1z-a2b3c4d5e6f7a1",
    chinese_name: "湿跑道",
    english_name: "Wet Runway",
    definition: "既不干燥也未被污染的跑道。\n参见：污染跑道(Contaminated Runway), 干跑道(Dry Runway)。",
    equivalent_terms: "",
    see_also: "Contaminated Runway, Dry Runway",
    see_also_array: ["Contaminated Runway", "Dry Runway"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "b2s3t4u5-v6w7-4x1y-4z2a-b3c4d5e6f7g8b2",
    chinese_name: "风切变",
    english_name: "Wind Shear",
    definition: "大气中两点之间的风速或风向差异；不同高度的两点之间的差异是垂直切变；地理上两点之间的差异是水平切变。\n参见：机载风切变告警系统(Airborne Wind Shear Warning System), 前视风切变告警系统(Forward-looking Wind Shear Warning System)。",
    equivalent_terms: "",
    see_also: "Airborne Wind Shear Warning System, Forward-looking Wind Shear Warning System",
    see_also_array: ["Airborne Wind Shear Warning System", "Forward-looking Wind Shear Warning System"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "c3t4u5v6-w7x8-4y2z-5a3b-c4d5e6f7g8h9c3",
    chinese_name: "翼尖观察员",
    english_name: "Wing Walker",
    definition: "地勤人员的一员，其主要工作职能是在飞机地面移动（例如后推、拖曳）期间，沿着飞机翼尖行走，以确保飞机不与任何物体发生碰撞。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "d4u5v6w7-x8y9-4z3a-6b4c-d5e6f7g8h9i0d4",
    chinese_name: "工作单卡",
    english_name: "Work Card",
    definition: "参见：任务卡(Task Card)。",
    equivalent_terms: "",
    see_also: "Task Card",
    see_also_array: ["Task Card"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "e5v6w7x8-y9z0-4a4b-7c5d-e6f7g8h9i0j1e5",
    chinese_name: "工作场所安全",
    english_name: "Workplace Safety",
    definition: "运营人或服务提供商为保护人员和飞机免受意外伤害或损坏而制定的流程和程序（即维修操作安全、环境、防火或保护、安全第一设备的识别、机械设备的安全防护、FOD防护、内务管理以及“维修关键”润滑脂和液体的正确识别）。\n参见：职业健康与安全(Occupational Health and Safety)。",
    equivalent_terms: "Protection Systems",
    see_also: "Occupational Health and Safety",
    see_also_array: ["Occupational Health and Safety"],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "f6w7x8y9-z0a1-4b5c-8d6e-f7g8h9i0j1k2f6",
    chinese_name: "X射线",
    english_name: "XRAY",
    definition: "一种高能量和极短波长的电磁波，能够穿透许多对光不透明的材料。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  },
  {
    id: "g7x8y9z0-a1b2-4c6d-9e7f-g8h9i0j1k2l3g7",
    chinese_name: "零飞行时间训练 (ZFTT)",
    english_name: "Zero Flight Time Training (ZFTT)",
    definition: "一种飞行机组资格认证概念，其中：\n• 飞行训练和评估完全在高级模拟设备中进行，无需在飞机上进行飞行时间；\n• 在实际航线运行中，在运营人和/或国家为此目的指定的教员、评估员或现行合格机长的监督下，完成最终的能力展示。",
    equivalent_terms: "",
    see_also: "",
    see_also_array: [],
    source: "IATA Reference Manual for Audit Programs (IRM) Edition 13"
  }
];