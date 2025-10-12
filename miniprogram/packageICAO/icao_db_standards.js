// icao_db_standards.js
// 根据 ICAO 2024 产品与服务目录（英文版和中文版）完整更新。
// 本文件包含国际民航组织附件(Annexes)和空中航行服务程序(PANS)。

module.exports = [
  // === Annexes to the Convention on International Civil Aviation / 国际民用航空公约的附件 ===
  {
    docNumber: 'Annex 1',
    title: { en: 'Personnel Licensing', zh: '人员执照的颁发' },
    description: { en: 'Standards and Recommended Practices for the licensing of flight crew members, air traffic controllers, aircraft maintenance technicians, etc.', zh: '关于飞行机组成员、空中交通管制员、航空器维修技术人员等执照颁发的标准和建议措施。' },
    edition: '14th edition, July 2022. 156 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 2',
    title: { en: 'Rules of the Air', zh: '空中规则' },
    description: { en: 'Consists of general rules, visual flight rules and instrument flight rules.', zh: '由一般规则、目视飞行规则和仪表飞行规则组成。只要不与飞越国的规则发生冲突，这些规则即毫不例外地适用于公海和国家领土上空。' },
    edition: '10th edition, July 2005. 70 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 3',
    title: { en: 'Meteorological Service for International Air Navigation', zh: '国际空中航行气象服务' },
    description: { en: 'Standards, Recommended Practices and guidance material governing the provision of meteorological services to international air navigation.', zh: '包含关于向国际空中航行提供气象服务的标准、建议措施和一些指导材料。' },
    edition: '20th edition, July 2018. 218 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 4',
    title: { en: 'Aeronautical Charts', zh: '航图' },
    description: { en: 'Standards and Recommended Practices applicable to Aeronautical Charts.', zh: '适用于航图的标准和建议措施。' },
    edition: '11th edition, July 2009. 166 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 5',
    title: { en: 'Units of Measurement to be Used in Air and Ground Operations', zh: '空中和地面运行中所使用的计量单位' },
    description: { en: 'Standards and Recommended Practices for dimensional units to be used in air and ground operations.', zh: '包含了有关空中和地面运行中所使用的计量单位的标准和建议措施。' },
    edition: '5th edition, July 2010. 56 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 6-1',
    title: { en: 'Operation of Aircraft, Part I – International Commercial Air Transport – Aeroplanes', zh: '航空器的运行, 第I部分 — 国际商业航空运输 — 飞机' },
    description: { en: 'Specifies international Standards and Recommended Practices for aeroplanes used in international commercial air transport operation.', zh: '规定了关于国际商业航空运输运行中使用的客运或货运飞机的国际标准和建议措施。' },
    edition: '12th edition, July 2022. 242 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 6-2',
    title: { en: 'Operation of Aircraft, Part II – International General Aviation – Aeroplanes', zh: '航空器的运行, 第II部分 — 国际通用航空 — 飞机' },
    description: { en: 'Specifies international Standards and Recommended Practices for aeroplanes used in international general aviation operations.', zh: '规定了关于国际通用航空运行中使用的飞机的国际标准和建议措施。' },
    edition: '11th edition, July 2022. 182 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 6-3',
    title: { en: 'Operation of Aircraft, Part III – International Operations – Helicopters', zh: '航空器的运行, 第III部分 — 国际运行 — 直升机' },
    description: { en: 'International Standards and Recommended Practices governing international commercial air transport and general aviation operations for helicopters.', zh: '分为三篇。第一篇是定义和适用范围；第二篇是关于国际商业航空运输的国际标准和建议措施；第三篇是关于国际通用航空运行的国际标准和建议措施。' },
    edition: '11th edition, July 2022. 232 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 7',
    title: { en: 'Aircraft Nationality and Registration Marks', zh: '航空器国籍和登记标志' },
    description: { en: 'Standards adopted by ICAO as the minimum standards for the display of marks to indicate appropriate nationality and registration marks.', zh: '载有国际民航组织采纳的关于展示已被确定为符合《公约》第二十条规定的适当的国籍和登记标志的最低标准。' },
    edition: '6th edition, July 2012. 20 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 8',
    title: { en: 'Airworthiness of Aircraft', zh: '航空器适航性' },
    description: { en: 'Standards and Recommended Practices for the airworthiness of aircraft.', zh: '载有关于航空器适航性的标准和建议措施。' },
    edition: '13th edition, July 2022. 346 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 9',
    title: { en: 'Facilitation', zh: '简化手续' },
    description: { en: 'Standards and Recommended Practices, and related definitions and appendices concerning the facilitation of international air transport.', zh: '载有关于国际航空运输简化手续的标准和建议措施以及相关定义和附录。' },
    edition: '16th edition, July 2022. 114 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 10',
    title: { en: 'Aeronautical Telecommunications', zh: '航空电信' },
    description: { en: 'In six volumes, containing Standards, Recommended Practices, and guidance on aeronautical communication, navigation and surveillance systems.', zh: '共六卷，包含关于航空通信、导航和监视系统的标准、建议措施和指导材料。' },
    edition: 'Various editions for Volumes I-VI',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 11',
    title: { en: 'Air Traffic Services', zh: '空中交通服务' },
    description: { en: 'Defines air traffic services and specifies the worldwide Standards and Recommended Practices applicable in the provision of these services.', zh: '定义了空中交通服务，并且规定了提供这些服务时所适用的国际标准和建议措施。' },
    edition: '15th edition, July 2018. 136 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 12',
    title: { en: 'Search and Rescue', zh: '搜寻与援救' },
    description: { en: 'Sets forth the provisions applicable to the establishment, maintenance and operation of search and rescue services by Member States.', zh: '阐述了适用于各成员国在各自领土和公海上建立、维持和开展搜寻与援救服务的规定。' },
    edition: '8th edition, July 2004. 30 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 13',
    title: { en: 'Aircraft Accident and Incident Investigation', zh: '航空器事故和事故征候调查' },
    description: { en: 'Contains the international Standards and Recommended Practices for aircraft accident and incident investigation.', zh: '载有关于航空器事故和事故征候调查的国际标准和建议措施。' },
    edition: '12th edition, July 2020. 74 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 14-1',
    title: { en: 'Aerodromes, Volume I – Aerodrome Design and Operations', zh: '机场, 第I卷 — 机场设计和运行' },
    description: { en: 'Contains Standards and Recommended Practices that prescribe the physical characteristics, obstacle limitation surfaces and visual aids to be provided at aerodromes.', zh: '载有规定机场应提供的物理特性、障碍物限制面和目视助航设施，以及机场通常提供的某些设施和技术服务的标准和建议措施。' },
    edition: '9th edition, July 2022. 352 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 14-2',
    title: { en: 'Aerodromes, Volume II – Heliports', zh: '机场, 第II卷 — 直升机场' },
    description: { en: 'Contains Standards and Recommended Practices covering aspects of heliport planning, design and operations.', zh: '载有关于直升机场规划、设计和运行方面的标准和建议措施。' },
    edition: '5th edition, July 2020. 118 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 15',
    title: { en: 'Aeronautical Information Services', zh: '航空情报服务' },
    description: { en: 'Standards and Recommended Practices applicable to Aeronautical Information Services.', zh: '适用于航空情报服务的标准和建议措施。' },
    edition: '16th edition, July 2018. 58 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 16-1',
    title: { en: 'Environmental Protection, Volume I – Aircraft Noise', zh: '环境保护, 第I卷 — 航空器噪声' },
    description: { en: 'Contains the Standards and Recommended Practices for aircraft noise certification.', zh: '载有关于航空器噪声合格审定的标准和建议措施，以及有关航空器噪声测量和评估方法的国际规范。' },
    edition: '8th edition, July 2017. 246 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 16-2',
    title: { en: 'Environmental Protection, Volume II – Aircraft Engine Emissions', zh: '环境保护, 第II卷 — 航空器发动机排放' },
    description: { en: 'Contains Standards and Recommended Practices for aircraft engine emissions certification.', zh: '本卷载有关于航空器发动机排放合格审定的标准和建议措施。' },
    edition: '5th edition, July 2023. 180 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 16-3',
    title: { en: 'Environmental Protection, Volume III – Aeroplane CO2 Emissions', zh: '环境保护, 第III卷 — 飞机二氧化碳排放' },
    description: { en: 'Contains Standards and Recommended Practices for aeroplane CO2 emissions certification.', zh: '本卷载有关于飞机二氧化碳排放合格审定的标准和建议措施。' },
    edition: '1st edition, July 2017. 40 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 16-4',
    title: { en: 'Environmental Protection, Volume IV – Carbon Offsetting and Reduction Scheme for International Aviation (CORSIA)', zh: '环境保护, 第IV卷 — 国际航空碳抵消和减排计划（CORSIA）' },
    description: { en: 'Contains Standards and Recommended Practices for the implementation of CORSIA.', zh: '本卷载有关于实施国际航空碳抵消和减排计划（CORSIA）的标准和建议措施。' },
    edition: '2nd edition, July 2023. 124 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 17',
    title: { en: 'Aviation Security', zh: '航空安保' },
    description: { en: 'Standards and Recommended Practices concerned with the security of international air transport and is amended regularly to address the evolving threat.', zh: '载有关于国际航空运输安保的标准和建议措施，并定期进行修订以应对不断演化的威胁。' },
    edition: '12th edition, July 2022. 66 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 18',
    title: { en: 'The Safe Transport of Dangerous Goods by Air', zh: '危险物品的安全航空运输' },
    description: { en: 'Contains the broad principles governing the international transport of dangerous goods by air.', zh: '本附件载有关于危险物品的航空运输的广泛原则。' },
    edition: '4th edition, July 2011. 36 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Annex 19',
    title: { en: 'Safety Management', zh: '安全管理' },
    description: { en: 'Contains overarching provisions applicable to safety management functions related to, or in direct support of, the safe operation of aircraft.', zh: '载有适用于有关或直接支持航空器安全运行的安全管理职能的总体规定，并强调国家一级多个跨航空部门安全管理的重要性。' },
    edition: '2nd edition, July 2016. 46 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },

  // === Procedures for Air Navigation Services (PANS) / 空中航行服务程序 ===
  {
    docNumber: 'Doc 4444',
    title: { en: 'PANS-ATM – Air Traffic Management', zh: '空中交通管理程序' },
    description: { en: 'These procedures are complementary to the Standards and Recommended Practices contained in Annex 2 and Annex 11.', zh: '这些程序是对附件2和附件11所载的标准和建议措施的补充，并比标准和建议措施更为详细地阐明了空中交通服务单位在为交通提供各种服务时应适用的实际程序。' },
    edition: '16th edition, 2016. 466 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8168-1',
    title: { en: 'PANS-OPS – Aircraft Operations, Volume I – Flight Procedures', zh: '航空器运行程序, 第I卷 — 飞行程序' },
    description: { en: 'Describes operational procedures recommended for the guidance of flight operations personnel.', zh: '描述了为飞行运行人员提供指导而建议的运行程序。' },
    edition: '6th edition, 2018. 210 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8168-2',
    title: { en: 'PANS-OPS – Aircraft Operations, Volume II – Construction of Visual and Instrument Flight Procedures', zh: '航空器运行程序, 第II卷 — 目视和仪表飞行程序的设计' },
    description: { en: 'Intended for the guidance of procedures specialists and describes the essential areas and obstacle clearance requirements for safe instrument flight operations.', zh: '旨在为程序专家提供指导，描述了实现安全、正常仪表飞行运行的基本区域和障碍物越障要求。' },
    edition: '7th edition, 2020. 974 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8168-3',
    title: { en: 'PANS-OPS – Aircraft Operations, Volume III – Aircraft Operating Procedures', zh: '航空器运行程序, 第III卷 — 航空器运行程序' },
    description: { en: 'Contains procedures for aircraft operating procedures.', zh: '包含航空器运行程序的程序。' },
    edition: '1st edition, 2018. 122 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8400',
    title: { en: 'PANS-ABC – ICAO Abbreviations and Codes', zh: '国际民航组织缩略语和代码程序' },
    description: { en: 'Abbreviations and Codes approved by the Council of ICAO for worldwide use in the international aeronautical telecommunication service and in aeronautical information documents.', zh: '由国际民航组织理事会批准、酌情在全世界国际航空电信服务和航空情报文件中使用的缩略语和代码。' },
    edition: '9th edition, 2016. 88 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9868',
    title: { en: 'PANS-TRG – Training', zh: '培训程序' },
    description: { en: 'Contains material that provides for the uniform implementation of competency-based training and assessments for the multi-crew pilot licence (MPL) and maintenance personnel.', zh: '规定对多人制机组驾驶员执照（MPL）和维修人员统一实施基于胜任能力的培训和评估。' },
    edition: '3rd edition, 2020. 218 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9981',
    title: { en: 'PANS-Aerodromes', zh: '机场程序' },
    description: { en: 'Complementary to the SARPs in Annex 14, Volume I. Specifies operational procedures to be applied by aerodrome operators to ensure aerodrome operational safety.', zh: '补充附件14第I卷所含的标准和建议措施，更详细地规定了机场运营人为确保机场运行安全需采用的运行程序。' },
    edition: '3rd edition, 2020. 252 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 10066',
    title: { en: 'PANS-AIM - Aeronautical Information Management', zh: '航空情报管理程序' },
    description: { en: 'Guide through the detailed requirements for the collection, management, and provision of aeronautical data and information, supporting the transition from AIS to AIM.', zh: '指导航空数据和情报的收集、管理和提供的详细要求，支持从航空情报服务（AIS）向航空情报管理（AIM）的过渡。' },
    edition: '1st edition, 2018. 134 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7030',
    title: { en: 'Regional Supplementary Procedures', zh: '地区补充程序' },
    description: { en: 'Operating procedures supplementary to the Annexes and PANS developed to meet the needs of a specific ICAO Region.', zh: '为满足特定国际民航组织地区的需求而制定的对附件和PANS的补充运行程序。' },
    edition: '5th edition, 2008. 380 pp.',
    languages: ['E', 'F', 'R', 'S']
  }
];