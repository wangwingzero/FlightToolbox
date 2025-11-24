const baseDefinitions = [
    {
      "id": "18f0a0d1-196d-4e9e-8c4d-2a1f8c1b3f9a",
      "chinese_name": "1级性能运行",
      "english_name": "Operations in performance Class 1",
      "definition": "具有以下性能的运行，即在临界发动机失效的情况下，具有使直升机继续安全飞行到合适着陆区的性能，除非上述发动机失效情况发生在达到起飞决断点（TDP）之前或通过着陆决断点（LDP）之后，在这两种情况下，直升机必须能够在中断起飞或着陆区内着陆。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b",
      "chinese_name": "2级性能运行",
      "english_name": "Operations in performance Class 2",
      "definition": "具有以下性能的运行，即在临界发动机失效的情况下，具有使直升机继续安全飞行到合适着陆区的性能，除非上述发动机失效情况早在起飞阶段或迟至着陆阶段发生，在这两种情况下，直升机可能必须实施迫降。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "c7d8e9f0-a1b2-4c3d-8e4f-5a6b7c8d9e0f",
      "chinese_name": "3级性能运行",
      "english_name": "Operations in performance Class 3",
      "definition": "具有以下性能的运行，即在飞行中任何时候发生发动机失效的情况下，直升机都必须实施迫降。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "chinese_name": "I类运行",
      "english_name": "Category I (CAT I)",
      "definition": "决断高不低于60米（200英尺），并且能见度不低于800米或跑道视程不低于550米的精密仪表进近和着陆。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "a5b6c7d8-e9f0-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "II类运行",
      "english_name": "Category II (CAT II)",
      "definition": "决断高低于60米（200英尺）但不低于30米（100英尺），跑道视程不低于300米的精密仪表进近和着陆。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "b9c0d1e2-f3a4-4b5c-8d6e-7f8a9b0c1d2e",
      "chinese_name": "III类运行",
      "english_name": "Category III (CAT III)",
      "definition": "决断高低于30米（100英尺）或无决断高和跑道视程低于300米或无跑道视程限制的精密仪表进近和着陆。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f",
      "chinese_name": "安保测试",
      "english_name": "Security test",
      "definition": "对模拟实施非法干扰行为企图的航空安保措施所进行的隐蔽或公开的试验。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "d7e8f9a0-b1c2-4d3e-8f4a-5b6c7d8e9f0a",
      "chinese_name": "安保管制",
      "english_name": "Security control",
      "definition": "防止带入可能用于实施非法干扰行为的武器、炸药或其他危险装置、物品或物质的手段。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "e1f2a3b4-c5d6-4e7f-9a8b-9c0d1e2f3a4b",
      "chinese_name": "安保审计",
      "english_name": "Security audit",
      "definition": "对执行国家民用航空安保方案的各个方面是否符合要求进行的深入审查。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "f5a6b7c8-d9e0-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "安保演练",
      "english_name": "Security exercise",
      "definition": "全面安保演习是对非法干扰行为的模拟，目的是确保应变计划能充分应对不同类型的紧急情况。部分安保演习也是对非法干扰行为的模拟，目的是确保各参与机构和应变计划的各组成部分（如通信系统等）能作出充分响应。",
      "source": "Doc 8973《航空安保手册》"
    },
    {
      "id": "a9b0c1d2-e3f4-4b5c-8d6e-7f8a9b0c1d2e",
      "chinese_name": "安全",
      "english_name": "Safety",
      "definition": "与航空器的运行有关或直接支持航空器运行的航空活动的风险，被降低并控制在可接受水平的状态。",
      "source": "《国际民用航空公约》附件19 CCAR-398"
    },
    {
      "id": "b3c4d5e6-f7a8-4c9d-8e0f-1a2b3c4d5e6f",
      "chinese_name": "安全风险",
      "english_name": "Safety risk",
      "definition": "危险源后果或结果的可能性和严重程度。",
      "source": "《国际民用航空公约》附件19 AC-398-03"
    },
    {
      "id": "c7d8e9f0-a1b2-4d3e-8f4a-5b6c7d8e9f0a",
      "chinese_name": "安全管理体系",
      "english_name": "Safety management system (SMS)",
      "definition": "管理安全的系统方法，包括必要的组织机构、责任、政策和程序。",
      "source": "《国际民用航空公约》附件19 CCAR-398"
    },
    {
      "id": "d1e2f3a4-b5c6-4e7f-9a8b-9c0d1e2f3a4b",
      "chinese_name": "安全绩效",
      "english_name": "Safety performance",
      "definition": "行业或民航生产经营单位安全业绩的可衡量结果。",
      "source": "《国际民用航空公约》附件19"
    },
    {
      "id": "e5f6a7b8-c9d0-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "安全监察",
      "english_name": "Surveillance",
      "definition": "国家通过检查或审计的方式，对航空执照、合格证、授权或批准的持有人持续满足规定、达到国家所要求的胜任能力和安全水平情况进行主动核实的活动。",
      "source": "《国际民用航空公约》附件19"
    },
    {
      "id": "f9a0b1c2-d3e4-4b5c-8d6e-7f8a9b0c1d2e",
      "chinese_name": "安全监督",
      "english_name": "Safety oversight",
      "definition": "国家为确保从事航空活动的个人和组织遵守与安全有关的法律和规章而履行的职能。",
      "source": "《国际民用航空公约》附件19 CCAR-398"
    },
    {
      "id": "a3b4c5d6-e7f8-4c9d-8e0f-1a2b3c4d5e6f",
      "chinese_name": "安全检查",
      "english_name": "Screening",
      "definition": "对旨在查明和/或发现可能用来实施非法干扰行为的武器、炸药或其他危险装置、物品或物质的技术手段或其他手段进行的运用。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "b7c8d9e0-f1a2-4d3e-8f4a-5b6c7d8e9f0a",
      "chinese_name": "安全目标",
      "english_name": "Safety objective",
      "definition": "对预期安全结果的表述。",
      "source": "《国际民用航空公约》附件19"
    },
    {
      "id": "c1d2e3f4-a5b6-4e7f-9a8b-9c0d1e2f3a4b",
      "chinese_name": "安全迫降",
      "english_name": "Safe forced landing",
      "definition": "指不可避免的着陆或水上迫降，且期望航空器中或地面上的人不会受伤。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "d5e6f7a8-b9c0-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "安全数据",
      "english_name": "Safety data",
      "definition": "为参考、处理或分析而收集的、可用于维护或促进安全的一套事实或数值。",
      "source": "《国际民用航空公约》附件19"
    },
    {
      "id": "e9f0a1b2-c3d4-4b5c-8d6e-7f8a9b0c1d2e",
      "chinese_name": "安全系数",
      "english_name": "Factor of safety",
      "definition": "考虑到载荷可能大于假定值及设计和制造中的不确定性而采用的设计系数。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "f3a4b5c6-d7e8-4c9d-8e0f-1a2b3c4d5e6f",
      "chinese_name": "安全隐患",
      "english_name": "Safety hazard category II",
      "definition": "民航生产经营单位违反法律、法规、规章、标准、规程和安全管理制度规定，或者因风险控制措施失效或弱化可能导致民用航空器事故、民用航空器征候及一般事件等后果的人的不安全行为、物的危险状态和管理上的缺陷。按危害程度和整改难度，分为一般安全隐患和重大安全隐患。",
      "source": "AC-398-03"
    },
    {
      "id": "a7b8c9d0-e1f2-4d3e-8f4a-5b6c7d8e9f0a",
      "chinese_name": "颁照当局",
      "english_name": "Licensing Authority",
      "definition": "由局方指定负责人员执照颁发的机构。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "b1c2d3e4-f5a6-4e7f-9a8b-9c0d1e2f3a4b",
      "chinese_name": "报告点",
      "english_name": "Reporting point",
      "definition": "航空器作位置报告所依据的规定的地理位置。报告点分为强制报告点和要求报告点两类。",
      "source": "CCAR-71"
    },
    {
      "id": "c5d6e7f8-a9b0-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "爆炸物质",
      "english_name": "Explosive substance",
      "definition": "一种固态或液态物质（或两种物质的混合体），其本身通过化学反应能够产生气体，其温度和压力及速度足以给周围环境造成损坏。其中包括烟火物质，即使在它们不释放气体时。本身并不是爆炸物，但可能构成爆炸性气体、蒸气或烟尘环境的物质不包括在内。",
      "source": "Doc 8973《航空安保手册》"
    },
    {
      "id": "e3f4a5b6-c7d8-4c9d-8e0f-1a2b3c4d5e6f",
      "chinese_name": "备降直升机场",
      "english_name": "Alternate heliport",
      "definition": "备降直升机场：当直升机不能或不宜飞往预定着陆直升机场或在该直升机场着陆时可以飞往的另一具备必要的服务与设施、可满足航空器性能要求以及在预期使用时间可以使用的直升机场。备降直升机场包括以下几种：\n起飞备降直升机场：当直升机在起飞后较短时间内需要着陆而又不能使用原起飞直升机场时，能够进行着陆的备降直升机场。\n航路备降直升机场：当直升机在航路上需要改航的情况下，能够进行着陆的备降直升机场。\n目的地备降直升机场：当直升机不能或不宜在预定着陆直升机场着陆时能够着陆的备降直升机场。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "f7a8b9c0-d1e2-4d3e-8f4a-5b6c7d8e9f0a",
      "chinese_name": "背景审查",
      "english_name": "Background survey",
      "definition": "为评估有关人员是否适合从事民用航空相关工作，或是否可以在无人陪同下进入运输机场（含军民合用机场民用部分）控制区，而对其身份、经历、违法犯罪、社会关系、现实表现等情况进行的审查。",
      "source": "《国家民用航空安全保卫方案》(民航发(2023)18号"
    },
    {
      "id": "a1b2c3d4-e5f6-4e7f-9a8b-9c0d1e2f3a4b",
      "chinese_name": "编队飞行",
      "english_name": "Formation flight",
      "definition": "两架及两架以上航空器，按一定队形编组或者排列飞行。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "b5c6d7e8-f9a0-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "标准大气条件",
      "english_name": "Standard atmosphere",
      "definition": "标准大气 按下列条件所定义的大气：\na) 空气是理想干燥的气体；\nb) 其物理常数为：\n——海平面平均摩尔质量：Mo=28.964 420×10-3kg mol-1\n——海平面大气压力：Po=1013.250hPa\n——海平面温度：to=15°C To=288.15K\n——海平面大气密度：po=1.225 0kg m-3\n——冰点温度：Ti=273.15K\n——通用气体常数：R*=8.314 32JK-1mol-1\nc) 温度梯度为：\n地球位势高(km) 温度梯度(每标准地球位势千米开尔文)\n自 至\n-5.0 11.0 -6.5\n11.0 20.0 0.0\n20.0 32.0 +1.0\n32.0 47.0 +2.8\n47.0 51.0 0.0\n51.0 71.0 -2.8\n71.0 80.0 -2.0\n注1：标准地球位势米的值为9.80665 m2s-2。\n注2：各变量之间的关系和列出温度、压力、密度和地球位势各对应值的表，参见Doc 7488号文件。\n注3：Doc 7488号文件还列出比重、动力粘性、运动粘性和声速在各个高度上的值。",
      "source": "CCAR-34"
    },
    {
      "id": "c9d0e1f2-a3b4-4b5c-8d6e-7f8a9b0c1d2e",
      "chinese_name": "标准件",
      "english_name": "Standard part",
      "definition": "在完全符合国家标准或者行业规范的情况下生产的零部件，其中国家标准或者行业规范应当包含设计、生产和统一识别的要求，应当包括生产零部件和确保零部件制造符合性所需的所有信息，已经公开发布并且能够使得任何人都可以生产出该零部件。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "d3e4f5a6-b7c8-4c9d-8e0f-1a2b3c4d5e6f",
      "chinese_name": "标准仪表进场",
      "english_name": "Standard instrument arrival",
      "definition": "一种标准的按照仪表飞行规则划设的进场航线，为从航路或者航线至终端区内一个定位点或者航路点之间的飞行提供过渡。",
      "source": "CCAR-71"
    },
    {
      "id": "e7f8a9b0-c1d2-4d3e-8f4a-5b6c7d8e9f0a",
      "chinese_name": "标准仪表离场",
      "english_name": "Standard instrument",
      "definition": "一种标准的按照仪表飞行规则划设的离场航线，为终端区至航路或者航线之间的飞行提供过渡。",
      "source": "CCAR-71"
    },
    {
      "id": "f1a2b3c4-d5e6-4e7f-9a8b-9c0d1e2f3a4b",
      "chinese_name": "场面气压",
      "english_name": "QFE",
      "definition": "航空器着陆区域最高点的气压。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "a8f0603d-a375-4cac-8199-9376643fbc87",
      "chinese_name": "超越航空器",
      "english_name": "Overtaking aircraft",
      "definition": "从一架航空器的后方与该航空器对称面小于70度夹角向其接近。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "f74ea7cd-2805-4476-a62a-4d768ef41cde",
      "chinese_name": "超障高度/高",
      "english_name": "Obstacle clearance altitude (OCA/OCH)",
      "definition": "为遵循适当的超障准则所确定的相关跑道入口标高或适用时机场标高之上的最低高度和最低高。\n注1：超障高度以平均海平面为基准。超障高以跑道入口标高为基准，在非精密进近程序中一般以机场标高为基准，但当跑道入口标高低于机场标高2米（7英尺）以上时，则以跑道入口标高为基准。盘旋进近程序的超障高以机场标高为基准。\n注2：为方便起见，当同时使用上述两个术语时，可以用“超障高度/超障高”表示，缩写为“OCA/H”。",
      "source": "Doc 4444《空中交通管理》"
    },
    {
      "id": "a0861626-2853-4934-baa0-5fbcd45f5f17",
      "chinese_name": "程序转弯",
      "english_name": "Procedure turn",
      "definition": "在起始进近航迹和最后进近航迹的相反方向的一种机动飞行。飞行中先转弯脱离指定航迹后再作反向转弯，使航空器能够切入并沿指定航迹飞行。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "29edaf40-f5d6-4705-86e1-44b6873ac2c7",
      "chinese_name": "持续适航",
      "english_name": "Continuing airworthiness",
      "definition": "使航空器、遥控驾驶站、发动机、螺旋桨或零部件符合适用的适航要求并且在其整个使用寿命期间处于安全运行状态的一套过程。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "f744e7cf-83b0-4016-8516-ba5a363425ec",
      "chinese_name": "初级类航空器",
      "english_name": "Primary category aircraft",
      "definition": "符合以下条件，并按照初级类进行型号合格审定的航空器。\n(a)无动力驱动的航空器；或者由一台自然吸气式发动机驱动、在最大起飞重量着陆构型的VSO失速速度不大于113公里/小时（61节）的飞机；或者在海平面标准大气条件下主旋翼桨盘载荷限制值为29.3公斤/平方米（6磅/平方英尺）的旋翼航空器；\n(b)最大重量不大于1225公斤（2700磅）；或者对于水上飞机，不大于1530.9公斤（3375磅）；\n(c)包括驾驶员在内，最大座位数不超过4人；\n(d)客舱不增压。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "013eaae3-8348-466c-b6de-9c87060dd496",
      "chinese_name": "大型飞机",
      "english_name": "Large aeroplane, Large airplane",
      "definition": "最大审定起飞全重大于5700千克的飞机。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "b2951074-11aa-4e4e-abf6-428b8f82efd9",
      "chinese_name": "大型航空器",
      "english_name": "Large aircraft",
      "definition": "最大起飞重量大于5700千克的飞机以及最大起飞重量大于3180千克的直升机和动力提升航空器。",
      "source": "CCAR-61"
    },
    {
      "id": "dee98c8b-6b3b-4c37-8f02-da693048d873",
      "chinese_name": "地面能见度",
      "english_name": "Ground visibility",
      "definition": "由授权观测员或自动化系统报告的机场能见度。",
      "source": "《国际民用航空公约》附件2"
    },
    {
      "id": "6e3a1e8d-b0ff-4de5-9fe2-ad37ffd2eff6",
      "chinese_name": "等待程序",
      "english_name": "Holding procedure",
      "definition": "使航空器在等待进一步许可时保持在指定的空域内的一个预定机动动作。",
      "source": "《国际民用航空公约》附件4"
    },
    {
      "id": "f4529c27-e993-4970-acfc-2f814ed4e12a",
      "chinese_name": "等待点",
      "english_name": "Holding point",
      "definition": "为使进行等待的航空器能在指定的空域内保持位置而规定的定位点。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "536c2afb-c09e-42fd-91e8-b7cfe0092b8e",
      "chinese_name": "低空风切变",
      "english_name": "Low-level wind shear",
      "definition": "发生在600米高度以下的平均风矢量在空间两点之间的差值。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "e72b29a7-d0b1-4863-a4c1-bc3e2fdccf71",
      "chinese_name": "低能见度运行",
      "english_name": "Low-visibility operations (LVO)",
      "definition": "跑道视程低于550米和/或决断高低于60米（200英尺）的进近运行、或跑道视程低于400米的起飞运行。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "c8c2a7d8-56aa-49ac-b108-534fad3451ed",
      "chinese_name": "动力装置",
      "english_name": "Powerplant",
      "definition": "包括安装在航空器上的所有发动机、传动系统部件（如适用）、螺旋桨（如已安装）、其附件、附属部件及燃油和滑油系统，但不包括直升机的旋翼。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "4c40e9f1-2c07-4fe6-b243-c15bcbd176df",
      "chinese_name": "恶劣环境",
      "english_name": "Hostile environment",
      "definition": "存在以下因素之一的环境：\n1. 由于地面和周边环境原因无法实施安全迫降；\n2. 直升机乘员不能得到适当的保护，以免受到恶劣天气的影响；\n3. 未能提供与预期风险相适应的搜寻与援救响应/能力；\n4. 威胁地面上的人员或财产安全的风险超出可接受程度。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "f90efaf6-9b7c-4ead-8e1d-c6033e06bd8c",
      "chinese_name": "翻修",
      "english_name": "Overhaul",
      "definition": "根据相应技术文件的要求，通过对民用航空器或者其部件进行分解、清洗、检查、必要的修理或者换件、重新组装和测试来恢复民用航空器或者其部件的使用寿命或者适航性状态。",
      "source": "CCAR-145-R4"
    },
    {
      "id": "49addb06-89e2-4c1e-83a6-997ffdfb2c71",
      "chinese_name": "防拆换安保袋",
      "english_name": "Security tamper-evident bags (STEBs)",
      "definition": "仅供机场商店或在航空器上销售液体、气溶胶和凝胶时使用的专门设计的袋子。",
      "source": "Doc 8973《航空安保手册》"
    },
    {
      "id": "1d7d0a3f-923a-4131-b64a-a4fea04f07e3",
      "chinese_name": "飞机",
      "english_name": "Aeroplane, Airplane",
      "definition": "一种动力驱动的重于空气的航空器。其飞行升力主要由在给定飞行条件下保持固定的翼面上的空气动力反作用取得。",
      "source": "《国际民用航空公约》附件6、Doc9060《国际民航组织统计方案的参考手册》"
    },
    {
      "id": "fca63474-cefc-405b-aec4-13188b7f9fe7",
      "chinese_name": "飞行机组成员",
      "english_name": "Flight crew",
      "definition": "在飞行值勤期内对航空器运行负有必不可少的职责并持有执照的机组成员。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "ad0a2271-0dd0-4911-b187-3dce5284630d",
      "chinese_name": "飞行计划",
      "english_name": "Flight plan",
      "definition": "向空中交通服务单位提供的关于航空器一次预定飞行或部分飞行的规定资料。\n注1：“飞行计划”一词前可缀以“初始”、“申报的”、“现行”或“运行”等字样，以表示飞行的情况和不同阶段。\n注2：当该名词之后缀以“电报”两字时，它表示所传送的飞行计划数据的内容和格式。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "d9e0f1a2-b3c4-4b5c-8d6e-7f8a9b0c1d2e",
      "chinese_name": "飞行经历时间",
      "english_name": "Flight experience",
      "definition": "为符合航空人员执照、等级、定期检查或近期飞行经历要求中的训练和飞行时间要求，在航空器、飞行模拟机或飞行训练器上所获得的在座飞行时间，这些时间应当是作为飞行机组必需成员的时间，或在航空器、飞行模拟机或飞行训练器上从授权教员处接受训练或作为授权教员在驾驶员座位上提供教学的时间。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "1fd9c2fa-1cbd-4470-b67c-03bf82a12909",
      "chinese_name": "飞行模拟训练装置",
      "english_name": "Flight simulation training device",
      "definition": "飞行模拟训练装置：能够在地面模拟飞行条件的下列三种装置中的任何一种：\n飞行模拟机：能精确复现某型航空器的驾驶舱，逼真地模拟出机械、电气、电子等航空器系统的操纵功能、飞行机组成员的正常环境及该型航空器的性能与飞行特性；\n飞行程序训练器：能提供逼真的驾驶舱环境，模拟航空器的仪表反应和机械、电气、电子等航空器系统的简单操纵功能，以及特定级别航空器的性能与飞行特性；\n基本仪表飞行训练器：装有适当的仪表，能模拟航空器在仪表飞行条件下飞行时的驾驶舱环境。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "e6830ad8-bd64-4055-9d4b-ae5c14392e90",
      "chinese_name": "飞行区",
      "english_name": "Airfield area",
      "definition": "供飞机起飞、着陆、滑行和停放使用的场地，一般包括跑道、滑行道、机坪、升降带、跑道端安全区，以及仪表着陆系统、进近灯光系统等所在的区域，通常由隔离设施和建筑物所围合。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "e096e833-3bea-4774-bd24-55d3713998ec",
      "chinese_name": "飞行时间",
      "english_name": "Flight time",
      "definition": "航空器为准备起飞而借助自身动力开始移动时起，到飞行结束停止移动时止的总时间。对于飞机是指，从飞机为了起飞开始移动时起到飞行结束最后停止移动时为止的总时间。对于直升机是指，从直升机的旋翼开始转动时起到直升机飞行结束停止移动及旋翼停止转动为止的总时间。对于滑翔机是指，不论拖曳与否，从滑翔机为了起飞而开始移动时起到飞行结束停止移动时为止占用的飞行总时间。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "0649f093-f435-4238-8bc0-03bf24a97802",
      "chinese_name": "飞行手册",
      "english_name": "Flight manual",
      "definition": "一本包含有航空器适航限制条件和飞行机组成员安全操作该航空器所必需指令和信息的手册。该手册由航空器制造厂家编写，经航空器适航审定部门批准。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "d7906539-b98f-4899-94ed-c577084d43b8",
      "chinese_name": "飞行校验",
      "english_name": "Flight Inspection",
      "definition": "为了保证飞行安全，使用装有专门校验设备的飞行校验航空器，按照飞行校验的有关标准、规范，检查、校准和分析通信、导航、监视设备的空间信号质量、容限及系统功能，以及助航灯光的参数、容限，并根据检查、校准和分析结果出具飞行校验报告的活动。",
      "source": "CCAR-86-R1 AP-140-CA-2023-01"
    },
    {
      "id": "d2f746b9-c190-4274-b99c-49a2ed72c6ef",
      "chinese_name": "飞行运行员/签派员",
      "english_name": "Flight operations officer/flight dispatcher",
      "definition": "由运营人指定从事飞行运行控制和监督的人员，对于飞行签派员，应当持有CCAR-65部规定的执照，其他授权人员应符合本咨询通告要求，并就安全实施飞行向机长提供支援、情况介绍和/或协助。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "19aa7dba-87b0-49a4-a294-2cc8fa48f03e",
      "chinese_name": "飞行值勤期",
      "english_name": "Duty period",
      "definition": "从飞行或客舱机组成员需要为执行一次飞行或一系列飞行任务报到开始，直至其作为机组成员执行该次任务最后一次飞行的航空器最终停稳且发动机关闭为止的段时间。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "9c3e0556-7d24-4d81-9a4a-7f2b60721946",
      "chinese_name": "非恶劣环境",
      "english_name": "Non-hostile environment",
      "definition": "存在以下因素的环境：\n1. 地面和周边环境适宜实施安全迫降；\n2. 直升机乘员能够得到适当的保护，以免受到恶劣天气的影响；\n3. 提供了与风险相适应的搜寻与援救响应能力；\n4. 所评定的威胁地面上的人员或财产安全的风险在可接受程度内。\n注：人口稠密区范围内符合上述要求的地区被视为非恶劣环境。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "bd3ccbb1-c94d-4c6d-a5fc-9492dae8e26b",
      "chinese_name": "非法飞行",
      "english_name": "illegal flight",
      "definition": "除超轻型飞行器之外的航空器，从事国家法律法规禁止的民用航空飞行活动，符合下列情形之一：\na)航空器未进行国籍登记或未取得适航批准的；\nb)航空器驾驶员未取得执照和体检合格证书的；\nc)未按规定取得经营或运行许可开展经营活动的；\nd)飞行任务和飞行计划未取得空管部门批准的。",
      "source": "AC-395-AS-01"
    },
    {
      "id": "c5ac3407-aade-4af2-8f73-e5b3b3b05421",
      "chinese_name": "非法干扰行为",
      "english_name": "Acts of unlawful interference",
      "definition": "危害民用航空安全的行为或未遂行为，包括但不限于：\n(一)非法劫持航空器；\n(二)毁坏使用中的航空器；\n(三)在航空器上或机场扣留人质；\n(四)强行闯入航空器、机场或航空设施场所；\n(五)为犯罪目的而将武器或危险装置、材料带入航空器或机场；\n(六)利用使用中的航空器造成死亡、严重人身伤害，或对财产或环境的严重破坏；\n(七)散播危害飞行中或地面上的航空器、机场或民航设施场所内的旅客、机组、地面人员或大众安全的虚假信息。",
      "source": "CCAR-329 CCAR-332-R1"
    },
    {
      "id": "e6b812ba-ab80-4293-80bd-bd1a21be09d1",
      "chinese_name": "非精密进近",
      "english_name": "Non-precision approach",
      "definition": "使用全向信标台、无方向性无线信标台等地面设施，只提供方位引导，不提供下滑引导的仪表进近。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "82406752-f076-4626-ae27-b9b0e182d4b2",
      "chinese_name": "非精密进近程序",
      "english_name": "Non-precision approach procedure",
      "definition": "设计用于2DA类仪表进近运行的仪表进近程序。",
      "source": "《国际民用航空公约》附件6 Doc 4444《空中交通管理》"
    },
    {
      "id": "069b9a50-be05-4d6d-85a6-0fd9650ea785",
      "chinese_name": "非人口稠密区的恶劣环境",
      "english_name": "Non-congested hostile environment",
      "definition": "人口稠密区范围外的恶劣环境。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "bc3e6d9d-93dd-4f21-afb5-fb8fec5965f0",
      "chinese_name": "辅助动力装置",
      "english_name": "Auxiliary power unit (APU)",
      "definition": "航空器上自携的动力装置，用以在地面工作时或飞行中独立于产生推动力的发动机为航空器的各系统提供电气气压动力。",
      "source": "《国际民用航空公约》附件16"
    },
    {
      "id": "8611259d-09a6-4709-a430-8c24437e7ed7",
      "chinese_name": "复飞程序",
      "english_name": "Missed approach procedure",
      "definition": "如果不能继续进近时应当遵循的飞行程序。",
      "source": "CCAR-71"
    },
    {
      "id": "0941c2f0-37ef-4d4b-b6bb-fd86fbb03be7",
      "chinese_name": "复飞点",
      "english_name": "Missed approach point (MAPt)",
      "definition": "仪表进近程序中规定的一个点，为保证不违反最小超障余度，必须在该点或该点以前开始实施规定的复飞程序。",
      "source": "《国际民用航空公约》附件4"
    },
    {
      "id": "6e484d06-dd8e-4262-963d-b5cc38f252f7",
      "chinese_name": "副驾驶",
      "english_name": "Co-pilot",
      "definition": "在飞行时间内除机长以外的、在驾驶岗位执勤的持有执照的驾驶员，但不包括在航空器上仅接受飞行训练的驾驶员。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "3119f359-9cb1-4a3f-845a-f0474025d98e",
      "chinese_name": "改装",
      "english_name": "Modification",
      "definition": "对航空器、发动机或螺旋桨的型号设计做出的改动。改装还可包括作为一项需获得维修放行的维修任务而进行的改装。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "61e42bb8-bde8-486c-859f-6fde1a888437",
      "chinese_name": "高风险货物或邮件",
      "english_name": "High-risk cargo or mail",
      "definition": "由于具体情报视为对民用航空构成威胁；或者显现异常或拆换夹带迹象引起怀疑的货物或邮件。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "1535b943-7fac-4841-b268-2c25b34920b4",
      "chinese_name": "高架直升机场",
      "english_name": "Elevated heliport",
      "definition": "设在高出地面的建筑物上的直升机场。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "0a6f6b48-d68a-4f56-a037-d31ff2f7b3c9",
      "chinese_name": "公共航空运输",
      "english_name": "Public air transport (PAT)",
      "definition": "公共航空运输企业使用民用航空器经营的旅客、行李或者货物的运输，包括公共航空运输企业使用民用航空器办理的免费运输。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "f83b140e-e091-4ec4-8002-337b3a40349e",
      "chinese_name": "公共航空运输企业",
      "english_name": "Public air transport enterprise",
      "definition": "以营利为目的，使用民用航空器运送旅客、行李、邮件或者货物的企业法人。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "f2f3727c-6fc4-49f2-ac77-c9982ec8d46d",
      "chinese_name": "管制单位",
      "english_name": "Air traffic control unit",
      "definition": "全国空中交通运行管理单位、地区空中交通运行管理单位、空中交通服务报告室、区域管制单位、进近管制单位或机场塔台管制单位等不同含义的通称。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "c7f7e162-86d2-4473-9ddc-f44379c0ea44",
      "chinese_name": "管制地带",
      "english_name": "Control zone",
      "definition": "从地球表面向上延伸到规定上限的管制空域。",
      "source": "《国际民用航空公约》附件2"
    },
    {
      "id": "3636e626-3b09-4e01-92bf-ca526c167a7e",
      "chinese_name": "管制空域",
      "english_name": "Controlled airspace",
      "definition": "依据空域分类，对按仪表飞行规则飞行规则和目视飞行规则飞行的航空器提供空中交通管制服务而划定的空间。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "7a605de9-9cf5-4d83-a41b-0d22e119eac5",
      "chinese_name": "管制区",
      "english_name": "Control area (CTA)",
      "definition": "自地球表面之上的规定界限向上延伸的管制空域。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "8bb70bbd-1925-483a-aa89-16f405c37143",
      "chinese_name": "管制许可的界限",
      "english_name": "Clearance limit",
      "definition": "空中交通管制准许航空器达到的点。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "e22de431-f07e-4a71-824f-512f1069638c",
      "chinese_name": "国籍登记国",
      "english_name": "State of registry",
      "definition": "航空器在其登记簿上进行国籍登记的国家。",
      "source": "《国际民用航空公约》附件7"
    },
    {
      "id": "97a41eba-8eec-4434-b52e-48ba74acc21b",
      "chinese_name": "国际航空运输",
      "english_name": "International air transport",
      "definition": "根据当事人订立的航空运输合同，无论运输有无间断或者有无转运，运输的出发地点、目的地点或者约定的经停地点之一不在中华人民共和国境内的运输。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "6f942118-f684-460f-bd74-13400906db35",
      "chinese_name": "国际机场",
      "english_name": "International airport",
      "definition": "由中华人民共和国在其本国领土内指定作为国际航空运输出入境并办理有关海关、移民、公共卫生、动植物检疫和类似手续的任何机场。",
      "source": "《国际民用航空公约》附件9"
    },
    {
      "id": "36c3bd36-2412-43ed-8799-34137a7e5802",
      "chinese_name": "国家航空器",
      "english_name": "State aircraft",
      "definition": "用于执行军事、海关、警察飞行任务的航空器。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "137b1c0a-3040-4e5f-9443-f0bf08228746",
      "chinese_name": "国内航线",
      "english_name": "Domestic air route",
      "definition": "指运输的始发地、经停地和目的地均在中华人民共和国境内的航线。",
      "source": "CCAR-289TR-R1"
    },
    {
      "id": "3482920e-9160-4909-b3b4-9a3d333f283c",
      "chinese_name": "国内通程航班",
      "english_name": "Domestic through check-in flight",
      "definition": "通程航班参与方通过加入《通程航班服务协议》等协议，并在“国内通程航班服务管理平台”录入通程航班信息，为接受通程航班服务的旅客提供“一次支付、一次值机、一次安检、行李直挂、全程无忧”，必要时协助安排住宿等全流程保障的国内联程航班。\n1、“一次支付”是指旅客可在购票时一次性支付通程航班全部航程机票款；\n2、“一次值机”是指旅客可在始发机场一次性办理全部航程值机手续；\n3、“一次安检”是指按照《民用航空安全检查规则》规定，旅客可在始发机场完成全部航程安检手续，中转时未离开隔离区的无需重复安检；\n4、“行李直挂”是指旅客可在始发机场办理托运行李直挂手续，在中转机场无需提取托运行李；\n5、“全程无忧”是指当旅客在接受通程航班服务时，因航班不正常导致旅客非自愿变更客票或非自愿退票的，通程航班参与方应当履行协助义务，积极协调、相互配合，按照《通程航班服务协议》为旅客提供免费退改、协助旅客办理客票签转等保障服务。",
      "source": "《国内通程航班管理办法》(民航规(2023)31号)"
    },
    {
      "id": "ceece808-39c5-40da-9448-1895582f4170",
      "chinese_name": "航班",
      "english_name": "Flight",
      "definition": "航空器使用同一航班号按照规定的路线所执行的运输飞行任务，按照任务形式的不同可分为正班、加班、包机、专机、其他，其中正班和加班为定期航班，包机、专机和其他为非定期航班。",
      "source": "《民航综合统计调查制度》"
    },
    {
      "id": "e636ae88-f1b1-4fde-8f40-93c1a633d6aa",
      "chinese_name": "航班换季",
      "english_name": "Season change",
      "definition": "定期航班每年按照夏秋季和冬春季两个航季更新航班计划表。夏秋航季是指每年3月的最后一个完整周的星期日至10月的最后一个完整周的星期六；冬春秋季是指10月的最后一个完整周的星期日至第二年3月的最后一个完整周的星期六。",
      "source": "CCAR-73"
    },
    {
      "id": "72afeaac-12e1-4a90-96cb-9f532b24339b",
      "chinese_name": "航班取消",
      "english_name": "Flight cancellation",
      "definition": "因预计航班延误而停止飞行计划或者因延误而导致停止飞行计划的情况。",
      "source": "CCAR-300"
    },
    {
      "id": "3eb22a7b-f790-4a9a-8af6-bf3b918d90fe",
      "chinese_name": "航段",
      "english_name": "Flight stage",
      "definition": "在航班执行过程中航空器每一次从起飞至降落间的航程。凡航段的两端都在国内的称为国内航段，两端或有一端在国外的称为国际航段，两端在香港、澳门、台湾的或有一端在香港、澳门、台湾且另一端不在国外的称为地区航段。",
      "source": "《民航综合统计调查制度》"
    },
    {
      "id": "6b63ed32-6fa1-4dfe-b7da-18b96b8aa3bb",
      "chinese_name": "航季",
      "english_name": "Season",
      "definition": "根据国际惯例，航班计划分为夏秋或冬春秋季，夏秋航季是指每年3月的最后一个完整周的星期日至10月的最后一个完整周的星期六；冬春秋季是指10月的最后一个完整周的星期日至第二年3月的最后一个完整周的星期六。",
      "source": "CCAR-289TR-R1"
    },
    {
      "id": "b1fc8852-51d5-4225-86aa-5398f4adb722",
      "chinese_name": "航空安全员",
      "english_name": "In-flight security staff",
      "definition": "为了保证航空器及其所载人员的安全，在民用航空器上执行航空安全保卫任务，具有航空安全员资质的人员。",
      "source": "CCAR-69-R1"
    },
    {
      "id": "3b09d450-d583-43ad-94c1-7d26af65dd4f",
      "chinese_name": "航空电子设备",
      "english_name": "Avionics",
      "definition": "为航空器使用的所有电子设备(包括电气部分在内)指定的一个名词，它包括无线电、自动飞行控制和仪表系统。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "7491ea86-5baf-461d-ba5e-ec08809a94cb",
      "chinese_name": "航空发动机",
      "english_name": "Aircraft engine",
      "definition": "用于或准备用于航空器推进的装置。发动机至少包括其运转和控制所必需的那些部件和设备，但不包括螺旋桨/旋翼（如适用）。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "014ab281-b90c-4b00-a7ab-1613120985e9",
      "chinese_name": "航空公司",
      "english_name": "Airlines",
      "definition": "航空运输企业的法人名称，是从事向顾客提供定期或不定期航班航空运输服务的企业。",
      "source": "《民用航空货物运输术语》(GB/T 18041-2000)"
    },
    {
      "id": "194657f2-d2b8-41c6-8ead-440095c7c32e",
      "chinese_name": "航空货物",
      "english_name": "Air cargo",
      "definition": "除邮件或者行李外，已经或者将由民用航空器运输的物品，包括凭航空货运单运输的行李。",
      "source": "CCAR-275"
    },
    {
      "id": "281ff108-82f3-4d6c-8c0b-6a2ed04147fa",
      "chinese_name": "航空货运销售代理人",
      "english_name": "Cargo sales agent",
      "definition": "依照中华人民共和国法律成立的，与承运人签订销售代理协议，从事民用航空货物运输销售代理业务的企业。",
      "source": "CCAR-275"
    },
    {
      "id": "552b4893-4718-4ace-86e7-5603aed4b406",
      "chinese_name": "航空器",
      "english_name": "Aircraft",
      "definition": "能够依靠空气的反作用而不是空气对地面的反作用在大气中获得支撑的任何机器。",
      "source": "《国际民用航空公约》附件6、附件7 Doc 9060《国际民航组织统计方案的"
    },
    {
      "id": "b3af44e9-6f3f-445a-9226-288290323670",
      "chinese_name": "航空器安保检查",
      "english_name": "Aircraft security check",
      "definition": "对旅客可能已经进入过的航空器内部的检查和对货舱的检查，目的在于发现可疑物品、武器、炸药或其他危险装置、物品和物质。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "412529fd-ca84-453f-8456-dd867ff1fddf",
      "chinese_name": "航空器安保搜查",
      "english_name": "Aircraft security search",
      "definition": "对航空器内部和外部进行的彻底检查，目的在于发现可疑物品、武器、炸药或其他危险装置、物品或物质。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "0d6e2964-aef3-4e3a-a6c8-1227588afa29",
      "chinese_name": "航空器部件",
      "english_name": "Aircraft part",
      "definition": "除航空器机体以外的任何装于或者准备装于航空器的部件，包括发动机、螺旋桨和设备。",
      "source": "CCAR-145-R4"
    },
    {
      "id": "08ae61a5-b6aa-4cc2-9921-6c9c65ab10f6",
      "chinese_name": "航空器接近",
      "english_name": "Aircraft proximity",
      "definition": "根据驾驶员或空中交通服务人员所知情况，不仅航空器间相对位置和速度，而且其间的距离均可能处于危及相关航空器安全的态势。航空器接近分类如下：\n有碰撞危险 航空器存在严重碰撞危险接近的等级。\n安全无保证 航空器接近可能已危及航空器安全的危险等级。\n无碰撞危险 航空器接近不存在碰撞危险的等级。\n未定危险 尚无足够情报确定有关危险性，或排除含有此类危险性的，或与排除此类危险性自相矛盾证据的航空器接近的危险等级。",
      "source": "Doc 4444《空中交通管理》"
    },
    {
      "id": "9aac960b-0412-4fc0-94f1-c71ffddd5f75",
      "chinese_name": "航空器评审",
      "english_name": "Aircraft evaluation",
      "definition": "飞行标准管理工作职责的一部分，为航空器有关工程活动提供运行视角，指明适用的运行规章要求，对航空器的运行符合性进行评审。航空器评审的工作内容通常包括：航空器和发动机的运行文件和运行符合性，其中运行文件包括飞行机组（驾驶员）操作手册、主最低设备清单、维修文件、持续适航文件等；航空人员资格规范等。",
      "source": "CCAR-66-R3"
    },
    {
      "id": "04e9760d-2264-48ed-bdc0-605d993d1748",
      "chinese_name": "航空器识别标志",
      "english_name": "Aircraft identification",
      "definition": "相当或类似于空地通信中用作航空器呼号编码的一组字母、数字或两者的组合，并在陆地空中交通服务通信中被用来识别航空器。",
      "source": "Doc 4444《空中交通管理》"
    },
    {
      "id": "cebfcb36-91e0-4913-bbdc-70679aad88ba",
      "chinese_name": "航空器型别",
      "english_name": "Type of aircraft",
      "definition": "具有同一基本设计的所有航空器，包括其上的一切改装。但那些会改变操纵或飞行特性的改装除外。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "54fd4123-bd47-4a0c-a32a-7c7bf4ea49d9",
      "chinese_name": "航空情报服务",
      "english_name": "Aeronautical information service (AIS)",
      "definition": "提供规定区域内航行安全、正常和效率所必需的航空资料和数据的服务。",
      "source": "CCAR-175TM-R1"
    },
    {
      "id": "2183a9b1-499c-4ea0-a3b6-196fbe74063d",
      "chinese_name": "航空人员",
      "english_name": "Aviation personnel",
      "definition": "下列从事民用航空活动的空勤人员和地面人员：\n(一)空勤人员，包括驾驶员、飞行机械员、乘务员；\n(二)地面人员，包括民用航空器维修人员、空中交通管制员、飞行签派员、航空电台通信员。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "7b34c7f2-4bc4-4338-869e-01c51cb8f628",
      "chinese_name": "航空邮件",
      "english_name": "Air mail",
      "definition": "邮政企业通过航空运输方式寄递的信件、包裹等。",
      "source": "CCAR-339-R1"
    },
    {
      "id": "a6eec368-62c9-4af6-b00e-e391bafcf3a3",
      "chinese_name": "航空销售代理人",
      "english_name": "Aviation sales agent",
      "definition": "依照中华人民共和国法律成立的，与承运人签订销售代理协议，从事公共航空运输旅客服务销售业务的企业。",
      "source": "CCAR-273"
    },
    {
      "id": "7ea3bc0f-24c6-4d6e-bbcf-11dd50fee803",
      "chinese_name": "航空资料",
      "english_name": "Aeronautical information",
      "definition": "对航空数据进行收集、分析并整理格式后所得的资料。",
      "source": "《国际民用航空公约》附件15"
    },
    {
      "id": "03551716-7f37-4187-8b80-568a52581d0b",
      "chinese_name": "航空资料汇编",
      "english_name": "Aeronautical information publication (AIP)",
      "definition": "由国家发行或由国家授权发行的载有空中航行所必需的、持久的航行资料的出版物。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "e917aff0-2f52-4b70-adc0-877b124b7fac",
      "chinese_name": "航空作业",
      "english_name": "Aerial work",
      "definition": "使用航空器进行专业服务的航空器运行，如农业、建筑、摄影、测量、观察与巡逻、搜寻与援救、空中广告等。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "3f4c4a0f-ba3e-4fec-ad44-d3863480954e",
      "chinese_name": "航路",
      "english_name": "Airway",
      "definition": "以空中航道形式建立的，设有无线电导航设施或者对沿该航道飞行的航空器存在导航要求的管制区域或者管制区的一部分。",
      "source": "CCAR-71"
    },
    {
      "id": "014c6f0b-68d9-44fd-9a23-db28cb0c295a",
      "chinese_name": "航图",
      "english_name": "Aeronautical chart",
      "definition": "保证航空器运行以及其他航空活动所需要的有关规定、限制、标准、数据和地形等，以一定的图表形式集中编绘、提供使用的各种图的总称。",
      "source": "CCAR-175"
    },
    {
      "id": "d807856b-c440-45dc-8ce0-a50982b08d34",
      "chinese_name": "航线",
      "english_name": "Route",
      "definition": "在同一航班号下由航空器执行的全部航段所组成的飞行线路。其中，各航段的起讫点（技术经停点除外）都在国内的航线称为国内航线；航线中任意一个航段的起讫点（技术经停除外）在外国领土上的航线称为国际航线；航线中任意一个航段的起讫点在香港、澳门、台湾的航线称为地区航线（同时包含香港、澳门、台湾和外国起讫点的航线统计为国际航线）。",
      "source": "《民航综合统计调查制度》"
    },
    {
      "id": "cac6f841-db6a-407d-a231-85fe7f08a1a7",
      "chinese_name": "航向",
      "english_name": "Heading",
      "definition": "航空器纵轴所指的方向，通常以北（真北、磁北、罗盘北或者网格北）为基准，用“度”表示。",
      "source": "CCAR-71"
    },
    {
      "id": "b71cec1e-11b3-4bd5-aaab-5b350acf34a6",
      "chinese_name": "航行通告",
      "english_name": "NOTAM",
      "definition": "飞行人员和与飞行业务有关的人员必须及时了解的，以电信方式发布的，关于航行设施、服务、程序的建立、情况或者变化，以及对航行有危险的情况的出现和变化的通知。",
      "source": "CCAR-175TM-R2"
    },
    {
      "id": "b4bd19e9-d70d-4f1d-87ab-ee4d1455b400",
      "chinese_name": "滑翔机",
      "english_name": "Glider",
      "definition": "一种重于空气的航空器，其飞行升力主要由在给定飞行条件下保持不变的翼面上的空气动力反作用取得，通常无自身动力驱动，或者虽然有动力，但在自由飞行阶段不使用自身动力。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "486cf61f-617e-4b06-85bf-cb740fe3249f",
      "chinese_name": "滑行",
      "english_name": "Taxiing",
      "definition": "航空器凭借自身动力在机场场面上的活动。不包括起飞和着陆，但包括直升机在机场场面上空有地面效应的高度内按滑行速度的飞行，即空中滑行。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "0a9ba3a9-492c-4ad0-976f-05468187e6b5",
      "chinese_name": "滑行道",
      "english_name": "Taxiway",
      "definition": "在机场设置供飞机滑行并将机场的一部分与其他部分之间连接的规定通道。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "dcb126f0-4cfe-4152-9560-6d3ff1ed8437",
      "chinese_name": "活动区",
      "english_name": "Movement area",
      "definition": "飞行区内供航空器起飞、着陆、滑行和停放使用的部分，由机动区和机坪组成。",
      "source": "《民用机场飞行区技术标准》(MH5001-2021)"
    },
    {
      "id": "3d3c8e4c-9f05-47d8-9a94-7bfc457c7126",
      "chinese_name": "货机",
      "english_name": "Cargo aircraft",
      "definition": "以包机或定期航班的形式专门运输邮件或货物的飞机。",
      "source": "《国际民用航空公约》附件18"
    },
    {
      "id": "8479f05f-b811-4419-ba2b-261bb7b0e7b3",
      "chinese_name": "机场",
      "english_name": "Aerodrome",
      "definition": "陆上或水上的一块划定区域(包括所有建筑物、设施和设备)，其全部或部分供航空器着陆、起飞和地面活动之用。",
      "source": "《民用机场飞行区技术标准》(MH5001)"
    },
    {
      "id": "0202b704-cb58-4601-b036-bea2af1691a9",
      "chinese_name": "机场标高",
      "english_name": "Aerodrome elevation",
      "definition": "机场可用跑道中最高点的标高。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "89b8b3c3-772a-42dc-aefc-7be02b94cf51",
      "chinese_name": "机场管理机构",
      "english_name": "Airport authority",
      "definition": "依法组建的或者受委托的负责运输机场安全和运营管理的具有法人资格的机构。",
      "source": "《民用机场管理条例》"
    },
    {
      "id": "53b1defd-98ea-4db6-8e7f-1577a40bab81",
      "chinese_name": "机场基准点",
      "english_name": "Aerodrome reference point",
      "definition": "表示机场地理位置的指定点。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "49160761-4927-44eb-a028-c6c8063c96d1",
      "chinese_name": "机场交通",
      "english_name": "Aerodrome traffic",
      "definition": "在机场机动区内的一切交通以及在机场附近所有航空器的飞行。在机场机动区内的一切交通是指该区域内运行的航空器和车辆；在机场附近所有航空器的飞行是指已加入、正在进入和脱离起落航线的航空器的飞行。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "4323b595-5f64-4055-949d-ec19df98f29c",
      "chinese_name": "机场区域",
      "english_name": "Aerodrome area",
      "definition": "机场和为该机场划定的一定范围的设置各种飞行空域的空间。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "7899d54c-32f2-4709-afd7-e1d27a7c0841",
      "chinese_name": "机场所在国",
      "english_name": "State of the Aerodrome",
      "definition": "机场位于其领土之上的国家。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "89d14eab-1212-49da-8f69-5f1dda99fd34",
      "chinese_name": "机动区",
      "english_name": "Manoeuvring area",
      "definition": "飞行区内供航空器起飞、着陆和滑行的部分，不包括机坪。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "337f2046-fbca-4588-82a3-528f2cf47f9c",
      "chinese_name": "机坪",
      "english_name": "Apron",
      "definition": "机场内供航空器上下旅客、装卸邮件或货物、加油、停放或维修等使用的一块划定区域。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "7b9f8edf-d912-46bf-a4e1-8e02cf4f7a82",
      "chinese_name": "机位",
      "english_name": "Aircraft stand",
      "definition": "机坪上用于停放航空器的一块指定区域。",
      "source": "《国际民用航空公约》附件14"
    },
    {
      "id": "60001445-6feb-4ddc-8880-38f16af8796e",
      "chinese_name": "机载防撞系统",
      "english_name": "Airborne Collision Avoidance System (ACAS)",
      "definition": "以二次监视雷达（SSR）应答机信号为基础的航空器系统，它独立于地基设备而独立工作，向可能发生相撞的装有二次监视雷达应答机的航空器驾驶员提供咨询建议。",
      "source": "《国际民用航空公约》附件2"
    },
    {
      "id": "8f1e072d-578a-4ef6-a8d7-ae9282833582",
      "chinese_name": "机长",
      "english_name": "Pilot-in-command",
      "definition": "在飞行时间内负责航空器的运行和安全的驾驶员。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "650e2104-29a3-4dea-949b-1d1114caab89",
      "chinese_name": "机组成员",
      "english_name": "Crew member",
      "definition": "飞行期间在航空器上执行任务的航空人员，包括飞行机组成员和客舱乘务员。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "02d5bbb6-1d5a-416d-b4f8-2c66a8c8a365",
      "chinese_name": "基于胜任能力的培训和评估",
      "english_name": "Competency-based training and assessment",
      "definition": "以如下几点为特征的培训和评估：以绩效为导向、强调绩效标准及其衡量，以及按照规定的绩效标准开展培训。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "aaa0bed2-e4c0-47f1-b451-e41377aa64b8",
      "chinese_name": "基于性能导航",
      "english_name": "Performance-based navigation (PBN)",
      "definition": "基于性能要求的区域导航，供运行在空中交通服务航路、仪表进近程序或指定空域的航空器使用。",
      "source": "《国际民用航空公约》附件11"
    },
    {
      "id": "292f195f-0683-414b-a479-e6e96e1062d1",
      "chinese_name": "基于性能的监视",
      "english_name": "Performance-based surveillance (PBS)",
      "definition": "应用于提供空中交通服务的基于性能规范的监视。\n注：RSP规范包括分配给系统组件的监视性能要求，以在特定空域概念情境下提供的监视和拟实施的运行所需的相关数据传递时间、连续性、可用性、完好性、监视数据的准确性、安全性和功能来表述。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "14d1bdaa-6bd5-4bf7-86cf-6f94ea79c4eb",
      "chinese_name": "基于性能的通信",
      "english_name": "Performance-based communication (PBC)",
      "definition": "应用于提供空中交通服务的基于性能规范的通信。\n注：RCP规范包括分配给系统组件的通信性能要求，以在特定空域概念情境下提供的通信和拟实施的运行所需的相关业务处理时间、连续性、可用性、完好性、安全性和功能来表述。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "c0ac94e8-ed2a-4223-a847-5a1c05d6dd6f",
      "chinese_name": "加班",
      "english_name": "Extra-section flight",
      "definition": "一空运企业为满足市场需求，在被批准运营的定期航线上已确定的航班数目以外临时增加的航班。",
      "source": "CCAR-289TR-R1"
    },
    {
      "id": "fc0250e2-06b9-4ef0-b3a7-0a2963a1b32d",
      "chinese_name": "监察员",
      "english_name": "Civil Aviation Inspector",
      "definition": "即中国民用航空监察员，是指按照规定取得监察员资格的民航行政机关的执法岗位工作人员和受中国民用航空局委托从事民航行政执法工作的具有管理公共事务职能的事业组织编制内工作人员。",
      "source": "CCAR-18-R4"
    },
    {
      "id": "fa2e93a4-e1a7-44b8-a04a-6443c3d63455",
      "chinese_name": "接地点",
      "english_name": "Touchdown point",
      "definition": "预定下滑道和跑道相交的一点，或者精密进近雷达下滑道与着陆道面相关的一点。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "060eff54-0e42-48b0-a9d1-3920caf81229",
      "chinese_name": "经批准的训练",
      "english_name": "Approved training",
      "definition": "按照局方批准的特定课程并在监督下进行的训练。",
      "source": "Doc9379《建立与管理国家人员执照颁发系统的程序手册》"
    },
    {
      "id": "684b4d4a-b34c-47dd-987e-a3844a486cfd",
      "chinese_name": "精密进近",
      "english_name": "Precision approach",
      "definition": "使用仪表着陆系统或精密进近雷达等系统提供方位和下滑引导的仪表进近。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "0d8d2004-d5fb-4860-a0af-31d9725d46d6",
      "chinese_name": "精密进近程序",
      "english_name": "Precision approach procedure",
      "definition": "设计用于3DA或B类仪表进近运行的基于导航系统（ILS、MLS、GLS和SBAS I类）的仪表进近程序。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "59cf0cae-0a82-4759-a1e2-afd4aa358d33",
      "chinese_name": "径向线",
      "english_name": "Radial",
      "definition": "以甚高频无线电全向信标为中心辐射出的磁方位。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "ad5549f7-c6ce-49b7-842b-0a91705a0a1b",
      "chinese_name": "净空道",
      "english_name": "Clearway",
      "definition": "经选定或整备的可供航空器在其上空进行部分起始爬升至规定高度的陆地或水上划定的一块长方形区域。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "9301f22c-652c-492b-8282-81c14db4a6d7",
      "chinese_name": "局方",
      "english_name": "The Authority",
      "definition": "中国民用航空局、中国民用航空地区管理局及其派出机构。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "21a6d160-7bf5-4367-9845-fa0e80c47e0e",
      "chinese_name": "客机",
      "english_name": "Passenger aircraft",
      "definition": "载运除机组人员、具有公务身份的运营人雇员、国家主管当局授权代表或货运物或其他货物押运人之外的任何人员的航空器。",
      "source": "《国际民用航空公约》附件18"
    },
    {
      "id": "93d7bdbc-3478-4085-80f7-b7e119089a08",
      "chinese_name": "客票",
      "english_name": "Passenger ticket",
      "definition": "运输凭证的一种，包括纸质客票和电子客票。",
      "source": "CCAR-273"
    },
    {
      "id": "e4cc6eb7-218a-46bd-8024-df551afdfc7d",
      "chinese_name": "空中交通服务",
      "english_name": "Air traffic services (ATS)",
      "definition": "飞行情报服务、告警服务、空中交通咨询服务、空中交通管制服务（区域管制服务、进近管制服务或机场管制服务）等不同含义名词的统称。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "4b07628d-d11c-4671-949a-dcb229b0ab04",
      "chinese_name": "空中交通服务单位",
      "english_name": "Air traffic services unit; ATS unit",
      "definition": "管制单位、飞行情报部门等不同含义的通称。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "61425712-e803-4374-9b58-043bd9e817f3",
      "chinese_name": "空中交通管理",
      "english_name": "Air traffic management (ATM)",
      "definition": "有效地维护和促进空中交通安全，维护空中交通秩序，保障空中交通畅通，其内容主要包括空中交通服务、空中交通流量管理和空域管理。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "92f62b43-93f8-41b8-9b19-c0bf14ff282d",
      "chinese_name": "空中交通管制服务",
      "english_name": "Air traffic control service",
      "definition": "为下列目的提供的服务：\n1.防止航空器之间以及在机动区内的航空器与障碍物之间相撞；\n2.维护和加速空中交通有秩序地流动。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "feb92184-092c-484b-bec9-a83a8beabc7f",
      "chinese_name": "空中交通管制许可",
      "english_name": "Air traffic control clearance",
      "definition": "批准航空器按照管制单位规定的条件进行活动的许可，简称管制许可。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "7b61724d-265a-4950-95b7-42ef88479998",
      "chinese_name": "空中交通管制员",
      "english_name": "Air traffic controller (ATCO)",
      "definition": "经过空中交通管制专业训练，持有相应执照并从事空中交通管制业务的人员。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "de521d14-7e5d-4b76-b5e8-e7f3a16042d0",
      "chinese_name": "雷达",
      "english_name": "Radar",
      "definition": "一种提供目标物的距离、方位和高度等信息的无线电探测装置。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "cc9fe116-8e60-4ed1-b9b6-0b4776547279",
      "chinese_name": "雷达管制",
      "english_name": "Radar control",
      "definition": "直接使用雷达信息来提供空中交通管制服务。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "6b42ae02-ff33-4056-8c5e-6fb6af9bc03c",
      "chinese_name": "雷达管制员",
      "english_name": "Radar controller",
      "definition": "经过空中交通管制专业训练，取得雷达管制员执照并从事雷达管制业务的管制员。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "9ff134f7-b751-4791-98e5-2e47ba7421d0",
      "chinese_name": "雷达引导",
      "english_name": "Radar vectoring",
      "definition": "在使用雷达的基础上，以特定的形式向航空器提供航行引导。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "00d65ef8-daca-4bbc-b057-227bb9ed8651",
      "chinese_name": "离岸运行",
      "english_name": "Offshore operations",
      "definition": "通常大部分飞行是在海域上空实施的往返近海位置的运行。这些运行包括但不限于，近海石油、天然气和矿产勘探以及海上飞行员转送的保障工作。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "43452304-bb95-4422-baa4-4429d7287df5",
      "chinese_name": "流量控制",
      "english_name": "Flow control",
      "definition": "用来调节进入一指定空域、沿一指定航路飞行或飞往一指定机场的交通流量，从而确保最有效地利用空域的措施。",
      "source": "Doc 4444《空中交通管理》"
    },
    {
      "id": "d5c14e71-1ad8-48e2-a7a7-46109ff7675f",
      "chinese_name": "民航安全文化",
      "english_name": "Safety culture",
      "definition": "民航行业在民用航空安全实践活动中逐渐形成、占主导地位并为绝大多数从业者所接受的，对待民航安全的观念、态度、价值取向和行为方式的总称，核心理念是“生命至上、安全第一、遵章履责、崇严求实”。",
      "source": "《关于加强新时代民航安全文化建设的意见》(民航发 (2023) 11号)"
    },
    {
      "id": "e751e743-7bbb-4127-92b4-6c72df85fe1f",
      "chinese_name": "民航安全作风",
      "english_name": "Civil aviation",
      "definition": "民航从业人员在安全生产中表现出的稳定的态度和行为，特别是对指导和规定安全工作的各种理念、政策、法律法规、规章标准和准则规范的心理认同和行为反应。",
      "source": "《民航安全从业人员工作作风长效机制建设指南》(民航规(2022) 56号)"
    },
    {
      "id": "1cb41d8a-a800-497b-9a81-aefb90967a7b",
      "chinese_name": "民航行政机关",
      "english_name": "authority",
      "definition": "中国民用航空局、中国民用航空地区管理局及其派出机构。",
      "source": "根据多部规章确定"
    },
    {
      "id": "ed56233f-207b-4495-9bc3-502697cd94ad",
      "chinese_name": "民用航空安全保卫",
      "english_name": "Civil aviation security",
      "definition": "保护民用航空免遭非法干扰行为。这一目标的实现有赖于各项措施及人力、物力资源的综合利用。",
      "source": "《国家民用航空安全保卫方案》(民航发(2023)18号"
    },
    {
      "id": "5cbd9f95-ed8f-4de4-867e-378323a23917",
      "chinese_name": "民用航空安全保卫方案",
      "english_name": "Civil aviation security",
      "definition": "防止对国际民用航空的非法干扰行为的书面措施。",
      "source": "《国家民用航空安全保卫方案》(民航发(2023)18号"
    },
    {
      "id": "c09d2ee8-0a04-4bc6-bc96-5a2de553280c",
      "chinese_name": "民用航空安全信息",
      "english_name": "Civil aviation safety information",
      "definition": "在特定范畴内处理、组织或分析的安全数据，以支持安全管理和开发安全情报。民用航空安全信息是指事件信息、安全监察信息和综合安全信息。",
      "source": "《国际民用航空公约》附件19 CCAR-396-R4"
    },
    {
      "id": "8f3a6e72-231b-44d0-83bb-f90644d47958",
      "chinese_name": "民用航空产品",
      "english_name": "product",
      "definition": "民用航空器、航空发动机或者螺旋桨。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "f0350d5d-d14b-4420-ba7d-01697f9ad633",
      "chinese_name": "民用航空电信人员",
      "english_name": "Air Traffic Safety Electronics Personnel",
      "definition": "从事民用航空通信导航监视服务保障工作的技术人员。",
      "source": "CCAR-65TM-I-R3"
    },
    {
      "id": "1bf9a23b-ef1c-458f-b511-2258f83781e4",
      "chinese_name": "民用航空气象地面观测",
      "english_name": "Civil aviation surface meteorological observation",
      "definition": "由气象观测员在地面通过人工方式或利用设备对本机场及其跑道、进近着陆及起飞爬升地带的气象要素及其变化过程所进行的系统、连续地观察和测定的活动。",
      "source": "AP-117-TM-2021-01R2"
    },
    {
      "id": "42a016c9-85c6-468f-9c7f-dede64412655",
      "chinese_name": "民用航空气象人员",
      "english_name": "Aeronautical Meteorological Personnel",
      "definition": "从事民用航空气象观测、气象预报、气象设备保障的人员。",
      "source": "CCAR-65TM-II-R3"
    },
    {
      "id": "df76daed-60ad-441b-aea2-d34fc7980a03",
      "chinese_name": "民用航空器",
      "english_name": "Civil aircraft",
      "definition": "除用于执行军事、海关、警察飞行任务外的航空器。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "0bb30a48-1124-4d14-9094-11f3b39e6f80",
      "chinese_name": "民用航空器事故",
      "english_name": "Accident",
      "definition": "对于有人驾驶航空器而言，从任何人登上航空器准备飞行直至所有这类人员下了航空器为止的时间内，或者对于获得民航局设计或者运行批准的无人驾驶航空器而言，从航空器为飞行目的准备移动直至飞行结束停止移动且主要推进系统停车的时间内，或者其他在机场活动区内发生的与民用航空器有关的下列事件：\n(一)人员死亡或者重伤。但是，由于自然、自身或者他人原因造成的人员伤亡，以及由于偷乘航空器藏匿在供旅客和机组使用区域外造成的人员伤亡除外。\n(二)航空器损毁无法修复或者严重损坏。\n(三)航空器失踪或者处于无法接近的地方。",
      "source": "CCAR-395-R3"
    },
    {
      "id": "7e2e5b8c-7b67-419d-86f5-577a157b5dba",
      "chinese_name": "民用航空情报员",
      "english_name": "AIS personnel",
      "definition": "从事收集、整理、编辑民用航空资料，设计、制作、发布航空情报产品，提供及时、准确、完整的民用航空活动所需的航空情报服务工作的人员。",
      "source": "CCAR-65TM-III-R4"
    },
    {
      "id": "bd64d74c-c66b-48a7-bc4c-a638347df44e",
      "chinese_name": "民用机场",
      "english_name": "Civil airport",
      "definition": "专供民用航空器起飞、降落、滑行、停放以及进行其他活动使用的划定区域，包括附属的建筑物、装置和设施。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "fdd09d1f-fcd5-42ed-84f1-8319504e86af",
      "chinese_name": "目视飞行规则",
      "english_name": "Visual flight rules (VFR)",
      "definition": "按照目视气象条件飞行的管理规则。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "f5190ccc-b910-4742-8ea0-a7fda6a44b4d",
      "chinese_name": "目视进近",
      "english_name": "Visual approach",
      "definition": "当部分或全部仪表进近程序尚未结束时，通过目视参照地标实施仪表飞行规则(IFR)的进近。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "f0244a89-acbb-4c4c-a4ba-f30d0e53de5c",
      "chinese_name": "目视气象条件",
      "english_name": "Visual meteorological conditions (VMC)",
      "definition": "用能见度、离云的距离和云高表示，等于或者高于规定最低标准的气象条件。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "2fb52df3-b346-4253-a896-3a06357cc929",
      "chinese_name": "盘旋进近",
      "english_name": "Circling approach",
      "definition": "仪表进近程序的延伸。航空器在按照仪表进近程序进近过程中不能直线进近着陆时，在机场上空目视对正跑道的机动飞行。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "d9eec4b8-f715-4392-90b4-85000d590aed",
      "chinese_name": "跑道",
      "english_name": "Runway",
      "definition": "陆地机场上经修整供航空器着陆和起飞而划定的一块长方形场地。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "c497afb7-bee8-4202-a1ae-34a59a93fd99",
      "chinese_name": "跑道入口",
      "english_name": "Threshold",
      "definition": "跑道可用于着陆部分的起端。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "20a9b861-5d04-4c24-a585-f17b41dc4f6a",
      "chinese_name": "跑道视程",
      "english_name": "Runway visual range (RVR)",
      "definition": "航空器驾驶员在跑道中线上，能看到跑道道面标志、跑道灯光轮廓或辨认跑道中线的距离。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021) CCAR-93TM-R6"
    },
    {
      "id": "ba3c949d-2c47-4d40-8144-17929f3b761f",
      "chinese_name": "批准的培训机构",
      "english_name": "Approved traning organization",
      "definition": "经局方批准并在其监督下按照相关的要求进行经批准的训练的机构。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "45383140-5441-4a15-ae67-c85f07df3066",
      "chinese_name": "疲劳",
      "english_name": "Fatigue",
      "definition": "因睡眠不足、长期失眠、生理周期和/或工作量（精神和/或身体活动）导致精神或身体行为能力下降的生理状态，它影响人员适当执行与安全有关的运行任务的注意力和能力。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "852f7a95-3505-41b7-8c44-af57d5efeb63",
      "chinese_name": "疲劳风险管理体系",
      "english_name": "Fatigue Risk Management System (FRMS)",
      "definition": "一种以科学原理和运行经验为基础，通过数据驱动，对疲劳风险进行持续监测和管理，保证相关人员在履行职责时保持充分警觉性的管理系统。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "60417aee-77b4-48ce-ac8f-a617588dedba",
      "chinese_name": "疲劳关键结构",
      "english_name": "Fatigue critical structure (FCS)",
      "definition": "按照《运输类飞机适航标准》第25.571条所确定的对可能导致灾难性破坏的疲劳开裂敏感的飞机结构。疲劳关键结构包括这样的结构，如果它被修理或改装，则容易产生疲劳开裂并导致灾难性破坏。这类结构可以是基准结构或改装结构的一部分。",
      "source": "CCAR-26"
    },
    {
      "id": "4f11aa80-1ed8-4363-8e3e-e26fbca6f66b",
      "chinese_name": "起飞功率",
      "english_name": "Takeoff power",
      "definition": "（一）对于活塞式发动机，指在标准海平面条件下，经批准用于正常起飞时曲轴转速和发动机进气压力处于最大状态时产生的制动马力，并限定在批准的发动机技术说明书中所示的那一段时间内连续使用。\n（二）对于涡轮发动机，指在规定高度和大气温度下，经批准用于正常起飞的转子转速和燃气温度处于最大状态静止时所产生的制动马力，并限定在批准的发动机技术说明书中所示的那一段时间内连续使用。",
      "source": "FAR-1"
    },
    {
      "id": "3f93f06f-f4a0-4272-b632-4d8695c2ea8f",
      "chinese_name": "起飞跑道",
      "english_name": "Take-off runway",
      "definition": "供起飞用的跑道。",
      "source": "《国际民用航空公约》附件14"
    },
    {
      "id": "1fda0fd7-a52a-4623-b4e5-51017bb68052",
      "chinese_name": "起飞时间",
      "english_name": "Take off time (TOT)",
      "definition": "航空器开始起飞滑跑时支撑装置移动的瞬间，或对于起飞不需要滑跑的航空器，为航空器以起飞为目的离开支撑表面的瞬间。",
      "source": "CCAR-61R5"
    },
    {
      "id": "43ef8cbf-6fe6-41a9-949e-b14acbebad25",
      "chinese_name": "起落航线",
      "english_name": "Traffic circuit",
      "definition": "为航空器在机场滑行、起飞或着陆规定的流程。由五个边组成。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "6233c5ed-349a-4974-b6f6-34fd72cd5f67",
      "chinese_name": "气球",
      "english_name": "Balloon",
      "definition": "非动力驱动的轻于空气的航空器。对于人员执照的颁发，气球是指自由气球。",
      "source": "《国际民用航空公约》附件7"
    },
    {
      "id": "a78923eb-8092-4767-8e02-8c6e8692be9b",
      "chinese_name": "气象报告",
      "english_name": "Meteorological report",
      "definition": "对某一特定时间和地点观测到的气象情况的报告。",
      "source": "CCAR-117-R2"
    },
    {
      "id": "9aeaf322-6a6a-493f-a1a4-069cd2c1034b",
      "chinese_name": "气象情报",
      "english_name": "Meteorological information",
      "definition": "有关现在的或预期的气象条件的气象报告、分析、预报和任何其他说明。",
      "source": "《国际民用航空公约》附件6 CCAR-117-R2"
    },
    {
      "id": "a59d521d-00a1-48fe-a538-1010d8c82a81",
      "chinese_name": "气象探测",
      "english_name": "meteorological",
      "definition": "利用科技手段对大气和近地层的大气物理过程、现象及其化学性质等进行的系统观察和测量。",
      "source": "CCAR-117-R2"
    },
    {
      "id": "2e36b433-2ac6-4570-97ba-30086c104750",
      "chinese_name": "轻型运动类航空器",
      "english_name": "Light sport aircraft (LSA)",
      "definition": "轻型运动类航空器是指符合下述定义的轻型运动飞机（固定翼）、滑翔机、自转旋翼机、轻型运动直升机或者轻于空气的航空器：\n1. 最大起飞重量不超过下列条件之一：\n(1) 700公斤(1540磅)的不用于水上运行的航空器；\n(2) 750公斤(1650磅)的用于水上运行的航空器。\n2. 轻型运动直升机,在海平面标准大气条件下,最大连续功率状态下最大平飞空速(VH)不超过90节校正空速。除轻型运动直升机外的其他航空器,在海平面标准大气条件下,最大连续功率状态下最大平飞空速(VH)不超过120节校正空速。\n3. 对于无动力滑翔机,不可超越速度(VNE)不超过120节校正空速。\n4. 在最大审定起飞重量和最临界的重心位置,并不使用增升装置的条件下,航空器最大失速速度或者最小定常飞行速度(VS1)不超过49节校正空速。\n5. 包括飞行员在内的最大座位数不超过2座。\n6. 如果具有座舱,座舱为非增压座舱。\n7. 对于动力航空器,发动机为电动发动机或单台活塞式发动机。\n8. 对于除动力滑翔机外的动力航空器,螺旋桨为定距螺旋桨或者地面可调桨距螺旋桨。\n9. 对于动力滑翔机,螺旋桨为定距螺旋桨或者可顺桨的螺旋桨。\n10. 对于自转旋翼机,旋翼系统为定距、半铰接、跷跷板式、两片桨叶旋翼系统。\n11. 对于除滑翔机或者用于水上运行的航空器之外的航空器,装有固定起落架。\n12. 对于用于水上运行的航空器,如装有起落架,起落架为固定或可收放起落架；对于此类航空器,底部结构也可为船体结构或软式浮筒。\n13. 对于滑翔机,装有固定或可收放起落架。",
      "source": "《关于修改轻型运动类航空器定义和发布轻型运动直升机技术标准的通知》(民航适发(2019)9号)"
    },
    {
      "id": "71519ac1-cb0a-46e0-9448-f9a93e25f063",
      "chinese_name": "轻于空气的航空器",
      "english_name": "Lighter-than-air aircraft",
      "definition": "任何主要由于浮力而支持在空中的航空器。",
      "source": "《国际民用航空公约》附件7"
    },
    {
      "id": "0888bd68-92c1-48f5-b592-b99c7f2f84d1",
      "chinese_name": "区域导航",
      "english_name": "Area navigation (RNAV)",
      "definition": "在以地面台站为基准的导航设施的作用范围内，或者在航空器自备导航设备的覆盖范围内，或者在两者相结合的条件下，航空器在任何欲飞航径上飞行的一种导航方法。",
      "source": "CCAR-71"
    },
    {
      "id": "0b6a738b-1ba7-4839-a626-31c6631dc046",
      "chinese_name": "区域管制单位",
      "english_name": "Area control centre (ACC)",
      "definition": "对所辖管制区内受管制的飞行提供空中交通管制服务而设立的单位。",
      "source": "《国际民用航空公约》附件3"
    },
    {
      "id": "739f9d31-df66-4d4e-aba1-784074c6f34e",
      "chinese_name": "权益转让协议",
      "english_name": "Licensing Agreement",
      "definition": "指设计批准持有人与生产批准持有人或者申请人之间签署的、以确定双方为生产民用航空产品或者零部件使用所需的设计资料的权利及责任的合同或者安排。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "f1a08453-0d6a-437f-b107-08d779e14f9c",
      "chinese_name": "扰乱性旅客",
      "english_name": "Disruptive passenger",
      "definition": "在机场或在航空器上不遵守行为规范，或不听从机场工作人员或机组人员指示，从而扰乱机场或航空器上良好秩序和纪律的旅客。\n从航空器起飞前舱门关闭时刻起至着陆后舱门打开时刻止在民用航空器上实施如下行为者：\na)实施攻击、恐吓、威胁或故意胡作非为，从而危及正常秩序或人员、财产安全；\nb)对履行职责的机组成员实施攻击、恐吓、威胁或干扰，或使其履行职责的能力降低；\nc)故意胡作非为，或损坏航空器、其设备或附带结构和设备，以致危及正常秩序和航空器或其机上人员的安全；\nd)散播已知虚假的信息，从而危及飞行中航空器的安全；和\ne)不服从确保安全、有序或高效运行的合法指挥或指示。",
      "source": "《国际民用航空公约》附件17"
    },
    {
      "id": "6b0330a6-10f6-4e16-87f4-21851015dbba",
      "chinese_name": "人的因素原理",
      "english_name": "Human Factors principles",
      "definition": "应用于航空领域中设计、审定、训练、运行与维修等方面，通过适当考虑人的表现来寻求实现人与其他系统组件之间安全配合的原理。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "e07be293-ed8c-4422-bc50-14290a51bb9e",
      "chinese_name": "人口稠密区",
      "english_name": "Congested area",
      "definition": "就城镇或居民区而言，任何主要用于居住、商业或娱乐目的的区域。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "c1d49271-a299-477f-aa3e-b12ee5a0e2d8",
      "chinese_name": "人口稠密区的恶劣环境",
      "english_name": "Congested hostile environment",
      "definition": "人口稠密区范围内的恶劣环境。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "d7ff638c-5ba6-43cd-b02f-af6b5540ac6c",
      "chinese_name": "日历日",
      "english_name": "Calendar day",
      "definition": "按照世界协调时间或者当地时间划分的时间段，从当日00：00至23：59的24小时。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "f3599507-a340-4ddc-97ac-4c3258a3b7e9",
      "chinese_name": "日历月",
      "english_name": "Calendar month",
      "definition": "按照世界协调时间或者当地时间划分，从本月1日零点到下个月1日零点之间的时段。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "f6f4fd89-e361-4c64-9d68-c3a9599a6b58",
      "chinese_name": "商业航空运输运行",
      "english_name": "Commercial air transport operation",
      "definition": "为获取酬金或租金从事乘客、货物或邮件运输的航空器运行。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "53cab6e1-42a0-4256-b4ac-acc46b7d32a2",
      "chinese_name": "设计国",
      "english_name": "State of design",
      "definition": "对负责航空器型号设计的机构拥有管辖权的国家。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "5ccba256-ee29-459c-8b82-76f225072fc2",
      "chinese_name": "设计批准",
      "english_name": "Design approval",
      "definition": "局方颁发的用以表明该航空产品或者零部件设计符合相关适航规章和要求的证件，其形式可以是型号合格证、型号认可证、型号合格证更改、型号认可证更改、补充型号合格证、改装设计批准书、补充型号认可证、零部件设计批准认可证，或者零部件制造人批准书、技术标准规定项目批准书对设计部分的批准，或者其他方式对设计的批准。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "b2fcbac1-f905-4b44-a28b-529d9a7d4a1c",
      "chinese_name": "生产批准",
      "english_name": "Production approval",
      "definition": "局方颁发用以表明允许按照经批准的设计和经批准的质量系统生产民用航空产品或者零部件的证件，其形式可以是生产许可证或者零部件制造人批准书、技术标准规定项目批准书对生产部分的批准。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "4f4e7f45-ba63-4ddd-b046-db76361594aa",
      "chinese_name": "胜任能力",
      "english_name": "Competency",
      "definition": "被用来对满意的工作绩效进行可靠预测的人的行为能力所涉范围。胜任能力要通过在规定条件下运用相关知识、技能和态度来开展各项活动或任务的行为加以体现和观察。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "f04102cf-0034-4827-9390-c1bd93d06d9f",
      "chinese_name": "胜任能力标准",
      "english_name": "Competency standard",
      "definition": "在评估是否已达到胜任能力时被确定为可接受的绩效水平。",
      "source": "《国际民用航空公约》附件1"
    },
    {
      "id": "4b4264d0-efda-4891-a3c9-f9f97170885c",
      "chinese_name": "适航",
      "english_name": "Airworthy",
      "definition": "民用航空产品或其零部件符合经批准的设计并处于安全可用状态的状况。",
      "source": "适航司根据《国际民用航空公约》附件8确定"
    },
    {
      "id": "225e178f-47c4-4468-b9db-63a5d91fee41",
      "chinese_name": "适航批准",
      "english_name": "Airworthiness approval",
      "definition": "局方为某一航空器、航空发动机、螺旋桨或者零部件颁发的证件，表明该航空器、航空发动机、螺旋桨或者零部件符合经批准的设计并且处于安全可用状态。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "034e716b-06af-4383-9d13-507ddc103e66",
      "chinese_name": "适航证件",
      "english_name": "Airworthiness certificates",
      "definition": "指型号审定、生产审定和适航审定相关证件。",
      "source": "CCAR-183AA-R1"
    },
    {
      "id": "8f4398ec-9f9f-4311-849d-5482ef466c2d",
      "chinese_name": "数据链通信",
      "english_name": "Data link communications",
      "definition": "通过数据链交换信息的一种通信方式。",
      "source": "《国际民用航空公约》附件2"
    },
    {
      "id": "770b66ee-5558-414c-b398-c533f6e83682",
      "chinese_name": "水上迫降",
      "english_name": "Ditching",
      "definition": "航空器被迫在水上降落。",
      "source": "《国际民用航空公约》附件12"
    },
    {
      "id": "111f3f15-e78e-45e9-894b-8b8315631272",
      "chinese_name": "所需导航性能",
      "english_name": "Required navigation performance",
      "definition": "在一个指定空域内运行所必需的导航性能的说明。",
      "source": "CCAR-71"
    },
    {
      "id": "a9e41ae8-1d37-46d6-9de6-2e2d42bff558",
      "chinese_name": "搜寻援救协调中心",
      "english_name": "Rescue coordination centre (RCC)",
      "definition": "负责督促并有效的组织本搜寻援救区内搜寻和援救服务、协调搜寻和援救工作的实施单位。",
      "source": "《中华人民共和国搜寻援救民用航空器规定》"
    },
    {
      "id": "1bd082d7-298b-4147-92aa-dd40361589b8",
      "chinese_name": "塔台管制单位",
      "english_name": "Aerodrome control tower",
      "definition": "为机场交通提供空中交通管制服务而设置的单位。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "930984c6-effe-4a1c-8858-258709e0a9be",
      "chinese_name": "特技飞行",
      "english_name": "Acrobatic flight",
      "definition": "含有航空器突然改变姿态，非正常姿态或非正常改变速度的有意机动飞行。",
      "source": "《国际民用航空公约》附件2"
    },
    {
      "id": "d1a8a32f-f5f8-4fb9-add2-f2e00d6dc195",
      "chinese_name": "体检合格证",
      "english_name": "Medical certificate",
      "definition": "依据民航法及民航局规章，按照相应医学标准体检鉴定合格，由民用航空卫生管理部门颁发的，表明体检合格证持有人身体状况符合相应医学标准的证明文件。",
      "source": "CCAR-67FS-R4"
    },
    {
      "id": "ccf80acb-5bf1-445c-ab4e-cc0dc3bc45d2",
      "chinese_name": "停止道",
      "english_name": "Stopway",
      "definition": "在可用起飞滑跑距离末端以外地面上一块划定的经过整备的长方形场地，适于航空器在中断起飞时能够在其上面停住。",
      "source": "《民用机场飞行区技术标准》(MH 5001-2021)"
    },
    {
      "id": "4cf0233b-a58a-4b9e-a0b2-067914a25c18",
      "chinese_name": "通勤类飞机",
      "english_name": "Commuter category aeroplane",
      "definition": "是指根据《正常类、实用类、特技特技类和通勤类飞机适航规定》（CCAR-23-R3）或等效标准按通勤类进行型号合格审定的，座位设置（不包括驾驶员）为19座或以下，最大审定起飞重量为8618公斤（19000磅）或以下，用于进行正常飞行所能遇到的任何机动失速（不包括尾冲失速）和坡度不大于60°的急转弯运行的多发动机飞机。",
      "source": "CCAR-23-R3、FAR 23-62"
    },
    {
      "id": "ae5fcc4d-bfca-4c54-93df-c374af9cb7ee",
      "chinese_name": "通用航空",
      "english_name": "General aviation (GA)",
      "definition": "使用民用航空器从事公共航空运输以外的民用航空活动，包括从事工业、农业、林业、渔业和建筑业的作业飞行以及医疗卫生、抢险救灾、气象探测、海洋监测、科学实验、教育训练、文化体育等方面的飞行活动。",
      "source": "《中华人民共和国民用航空法》"
    },
    {
      "id": "3215a97b-d150-4f65-8caf-787649dd0054",
      "chinese_name": "外国航空运输企业",
      "english_name": "Foreign air transport enterprise",
      "definition": "有权在我国和外国之间从事定期或不定期国际航空运输业务的外国航空承运人。",
      "source": "CCAR-315"
    },
    {
      "id": "3420ed4a-44da-4179-afc6-137a40dedafe",
      "chinese_name": "危险品",
      "english_name": "Dangerous goods",
      "definition": "列在《技术细则》危险品清单中或者根据《技术细则》的归类，能对健康、安全、财产或者环境构成危险的物品或者物质。",
      "source": "CCAR-276-R2"
    },
    {
      "id": "4f038222-03e9-4410-a8bd-33ce616ac8e1",
      "chinese_name": "危险源",
      "english_name": "Hazard",
      "definition": "可能导致民用航空器事故、民用航空器征候以及一般事件等后果的条件或者物体。",
      "source": "《国际民用航空公约》附件19"
    },
    {
      "id": "cc543bdc-a8f0-44ac-bee2-2a74fff8fed8",
      "chinese_name": "维修",
      "english_name": "Maintenance",
      "definition": "对航空器或者航空器部件所进行的任何检查、测试、修理、排故或者翻修工作。对于已经获得适航审定部门批准的设计更改的实施，也视为维修工作。",
      "source": "CCAR-91-R4 CCAR-145-R4"
    },
    {
      "id": "eaceec9a-dd4f-4fd4-bdce-4e5842551ec5",
      "chinese_name": "委任代表",
      "english_name": "Designated representative (DR)",
      "definition": "民航行政机关委派的民航行政机关以外、在授权范围内从事相关工作的人员，包括飞行标准委任代表、适航委任代表等。",
      "source": "CCAR-183AA-R1 CCAR-183FS"
    },
    {
      "id": "dd85d972-0ae0-4471-b523-06a5c69c7d32",
      "chinese_name": "委任单位代表",
      "english_name": "Designated organization representative (DOR)",
      "definition": "民航行政机关委派的民航行政机关以外、在授权范围内从事相关工作的单位或者机构，包括飞行标准委任单位代表、适航委任单位代表等。",
      "source": "CCAR-183AA-R1 CCAR-183FS"
    },
    {
      "id": "35facdc1-9928-41ab-bb84-378877b36c36",
      "chinese_name": "无人驾驶航空器",
      "english_name": "Unmanned aircraft",
      "definition": "没有机载驾驶员、自备动力系统的航空器。",
      "source": "《无人驾驶航空器飞行管理暂行条例》"
    },
    {
      "id": "b4421678-df0e-45fc-8bda-fc4e3f78ed4a",
      "chinese_name": "下滑道",
      "english_name": "Glide path",
      "definition": "最后进近时用于垂直引导而规定的下降剖面。",
      "source": "《国际民用航空公约》附件4"
    },
    {
      "id": "9ba2947d-31fa-4886-a46b-75b7ec322722",
      "chinese_name": "先进航空器",
      "english_name": "Advanced aircraft",
      "definition": "配备有对于特定起飞、进近或着陆运行除基本航空器所需设备之外的附加设备的航空器。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "1d0c1e8e-fd39-4ead-820d-35194666a070",
      "chinese_name": "限制区",
      "english_name": "Restricted area",
      "definition": "一个国家陆地领域或领海上空划定范围内，航空器飞行受到某些规定条件限制的空间。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "ec6a9edd-9162-417d-8ff2-ba63431827f1",
      "chinese_name": "小型航空器",
      "english_name": "Small aircraft",
      "definition": "最大起飞重量小于5700千克的飞机以及小于3180千克的直升机和动力提升航空器。",
      "source": "AC-91-FS-2018-036"
    },
    {
      "id": "71cbc34d-0f55-4026-bece-a3019eec142f",
      "chinese_name": "行李物品",
      "english_name": "Baggage; Baggage items",
      "definition": "旅客在旅行中为了穿着、使用、舒适或者方便的需要而携带的物品和其他个人财物。包括随身行李物品、托运行李。",
      "source": "CCAR-339-R1"
    },
    {
      "id": "e2c85763-03ec-413d-96cb-0ff53cc128a4",
      "chinese_name": "型号合格证",
      "english_name": "Type certificate",
      "definition": "局方颁发的，用来批准某一航空产品型号设计的证明文件。内容应当包括型号设计、使用限制、数据单、局方审查确认已符合的有关适航要求和环境保护要求，以及对民用航空产品所规定的其他条件或限制。",
      "source": "Doc 10019《遥控驾驶航空器系统手册》"
    },
    {
      "id": "87c8a49c-5e70-40c2-8f47-2164a687804c",
      "chinese_name": "型号设计",
      "english_name": "Type design",
      "definition": "规定航空器、遥控驾驶站、发动机或螺旋桨型号所需的一套数据和资料，以便确定适航性。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "f5986564-2308-40db-9536-b0e6ef597a45",
      "chinese_name": "幸存者",
      "english_name": "Survivor",
      "definition": "在民用航空器飞行事故中，没有因为事故受到致命伤害或者受到致命伤害经抢救而存活的人员。",
      "source": "CCAR-399"
    },
    {
      "id": "a9b40bd9-aefd-46e9-aa17-862a5a89c34a",
      "chinese_name": "修正海平面气压",
      "english_name": "QNH",
      "definition": "通过对观测到的场面气压，按照标准大气条件修正到平均海平面的气压。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "8bb1310b-d617-4267-9ef2-46c7be23d07f",
      "chinese_name": "旋翼机",
      "english_name": "Rotorcraft",
      "definition": "一种动力驱动的重于空气的航空器，其飞行的支撑力由一个或多个旋翼上的空气反作用获得。",
      "source": "《国际民用航空公约》附件7"
    },
    {
      "id": "97b18a9d-33ad-4f81-808c-3548071983a2",
      "chinese_name": "巡航高度层",
      "english_name": "Cruising level",
      "definition": "飞行的大部分时间所保持的高度层。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "38a123cf-01ff-4114-8cfb-028aaae29592",
      "chinese_name": "训练时间",
      "english_name": "Training time",
      "definition": "受训人在飞行中、地面上、飞行模拟机或飞行训练器上从授权教员处接受训练的时间。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "4b55001c-2169-49bf-bedf-3b6a92319ff9",
      "chinese_name": "休息期",
      "english_name": "Rest period",
      "definition": "值勤之后和/或之前一个连续和规定的时间段，在该段时间内，飞行或客舱乘务组成员可免于执行一切任务。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "d2777758-1c70-4cfa-8036-0f8c43b3b370",
      "chinese_name": "夜间",
      "english_name": "Night.",
      "definition": "从黄昏民用暮光结束到黎明民用曙光开始之间的时间。我国航空器驾驶员执照管理方面，在与夜间有关的规定中，为方便起见，将“夜间”视为是日落后1小时至日出前1小时之间的时间段。\n注：黄昏民用暮光日落时开始，在日轮中心位于地平线下6°时结束；黎明民用曙光在日轮中心位于地平线下6°时开始，日出时结束。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "9d7eafb1-7829-4a28-9c03-eb09e8a3750a",
      "chinese_name": "仪表飞行规则",
      "english_name": "Instrument flight rules (IFR)",
      "definition": "按照仪表气象条件飞行的管理规则。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "04b184fb-f451-4850-8c59-ca7cd72be89b",
      "chinese_name": "仪表进近",
      "english_name": "Instrument approach",
      "definition": "执行仪表飞行规则飞行的航空器按照仪表进近程序所进行的仪表进近或雷达进近。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "d2601609-e603-41c3-8524-164cb96c42ad",
      "chinese_name": "仪表进近程序",
      "english_name": "Instrument approach procedure (IAP)",
      "definition": "对障碍物保持规定的安全保护，参照飞行仪表所进行的一系列预定的机动飞行。这种机动飞行，从开始进近定位点或适用时从规定的进场航线开始，至完成着陆的一点为止。此后，如果不能完成着陆，则飞至使用等待或航路超障准则的位置。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "5252ea74-656c-468f-b328-8e2aeb786df5",
      "chinese_name": "仪表进近运行",
      "english_name": "Instrument approach operations.",
      "definition": "使用仪表引导按照仪表进近程序实施的进近和着陆。实施仪表进近运行有两种方法：\n二维（2D）仪表进近运行，只使用方位引导；\n三维（3D）仪表进近运行，使用方位引导和垂直引导。\n注：方位和垂直引导指由以下方式提供的引导：\na)地基无线电助航设备；\nb)通过地基、空中、自主导航设备或这些设备组合由计算机生成的导航数据。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "db30ca9e-ea9d-4588-8319-d1e25baab3f9",
      "chinese_name": "仪表跑道",
      "english_name": "Instrument runway",
      "definition": "供航空器用仪表进近程序飞行的下列各种类型跑道之一：\na)非精密进近跑道 配备有目视助航设施和非目视助航设施的跑道，供A类仪表进近运行之后和能见度不小于1000米的着陆运行。\nb)I 类精密进近跑道配备有目视助航设施和非目视助航设施的跑道，供决断高（DH）不低于60米（200英尺），能见度不小于800米或跑道视程不小于550米的B类仪表进近运行之后的着陆运行。\nc)II类精密进近跑道配备有目视助航设施和非目视助航设施的跑道，供决断高（DH）低于60米（200英尺）但不低于30米（100英尺），跑道视程不小于300米的B类仪表进近运行之后的着陆运行。\nd)III 类精密进近跑道配备有目视助航设施和非目视助航设施的跑道，供B类仪表进近运行之后的着陆运行，决断高（DH）低于30米（100英尺）或无决断高，跑道视程小于300米或无跑道视程限制的运行。\n注1：目视助航设施不一定要与所设置的非目视助航设施的等级相匹配，选择目视助航设施的准则依据运行的条件而定。",
      "source": "《国际民用航空公约》附件14"
    },
    {
      "id": "4b389c7e-482c-4f66-b83b-1bd97bca6a81",
      "chinese_name": "仪表气象条件",
      "english_name": "Instrument meteorological conditions (IMC)",
      "definition": "用能见度、离云的距离和云高表示，低于为目视气象条件所规定的最低标准的气象条件。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "f2062e1e-c149-4575-bbe8-195abb56c263",
      "chinese_name": "预计到达时刻",
      "english_name": "Estimated time of arrival",
      "definition": "对于仪表飞行规则飞行，是航空器到达基于导航设施确定的指定点上空的预计刻，并预定从该点开始仪表进近程序。如果该机场没有相应的导航设施，则为航空器将要达到该机场上空的时刻。对于目视飞行规则飞行，为航空器将要到达该机场上空的预计时刻。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "9adf4061-49a0-4180-a961-12b65bc6bf2c",
      "chinese_name": "运输机场",
      "english_name": "Transport airport",
      "definition": "为从事旅客、货物运输等公共航空运输活动的民用航空器提供起飞、降落等服务的机场。",
      "source": "《民用机场管理条例》"
    },
    {
      "id": "e1618532-93c9-485f-8f9b-5847c83e8b88",
      "chinese_name": "运输机场突发事件",
      "english_name": "Emergency at transport airports",
      "definition": "在机场及其邻近区域内，航空器或者机场设施发生或者可能发生的严重损坏以及其它导致或者可能导致人员伤亡和财产严重损失的情况。",
      "source": "CCAR-139-II-R1"
    },
    {
      "id": "b9876aa4-5935-447f-91fa-92e182e3b771",
      "chinese_name": "运输类飞机",
      "english_name": "Transport category airplane",
      "definition": "按照《运输类飞机适航规定》（CCAR-25部）或等效适航标准审定的飞机。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "6e8dff58-607f-4ecb-9d02-a5f0dc309d70",
      "chinese_name": "运输类旋翼航空器",
      "english_name": "Transport category rotorcraft",
      "definition": "按照《运输类旋翼航空器适航规定》（CCAR-29部）审定的旋翼航空器。",
      "source": "CCAR-29"
    },
    {
      "id": "119ed2e3-f367-4b03-b3fb-e7ee9e288f41",
      "chinese_name": "运输类直升机",
      "english_name": "Transport category helicopter",
      "definition": "按照《运输类旋翼航空器适航规定》（CCAR-29部）审定的直升机。",
      "source": "CCAR-91-R4"
    },
    {
      "id": "a0eb8d16-8812-4e09-97fc-63b30b8cc9ff",
      "chinese_name": "运行规范",
      "english_name": "Operations specification (OpSpecs)",
      "definition": "符合航空运营人许可证及其运行手册要求的授权包括特殊批准、条件和限制。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "be1b880b-5a18-47fb-90cc-a824f4c45b27",
      "chinese_name": "运行合格证",
      "english_name": "Air operator certificate (AOC)",
      "definition": "批准运营人从事特定航空运行种类的行政许可证件。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "81ed9d00-00d2-4630-8ef6-4225c81a07ae",
      "chinese_name": "运行基地",
      "english_name": "Operating base",
      "definition": "执行运行控制的地点。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "d0ec663c-958e-445f-912b-deff0fffafa1",
      "chinese_name": "运行手册",
      "english_name": "Operations manual",
      "definition": "运行人员在履行其职责时所用的包含程序、说明和指南的手册。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "30b5e767-8c03-42ad-9f79-6a7948c340d2",
      "chinese_name": "责任",
      "english_name": "Responsibility and accountability",
      "definition": "包含两层含义，一是指应当履行的职责和义务，二是指未履行或未正确履行职责和义务时应当承担的不利后果。",
      "source": "AC-398-05"
    },
    {
      "id": "75756afa-0845-4d59-a1c9-7f305edc5766",
      "chinese_name": "炸弹威胁",
      "english_name": "Bomb threat",
      "definition": "所传达的匿名或其他威胁，暗示或推断（无论真假）飞行中或地面上的航空器，或任何机场或民航设施或个人安全可能面临来自爆炸物或其他物体或装置的危险。",
      "source": "Doc 8973《航空安保手册》"
    },
    {
      "id": "c71dfb2b-797b-43ee-b45c-afb104e46bca",
      "chinese_name": "障碍物",
      "english_name": "Obstacle",
      "definition": "位于供航空器地面活动的区域上，或突出于为保护飞行中的航空器而规定的限制面上，或位于上述规定限制面之外但评定为对空中航行有危险的，临时或永久固定的和移动的物体，或是上述物体的一部分。",
      "source": "《国际民用航空公约》附件14"
    },
    {
      "id": "304e9b37-8be8-4309-999d-8548339da336",
      "chinese_name": "正常类旋翼航空器",
      "english_name": "Normal category rotorcraft",
      "definition": "按照《正常类旋翼航空器适航规定》（CCAR-27）或等效适航标准型号合格审定的旋翼航空器。",
      "source": "CCAR-27"
    },
    {
      "id": "8ef662b8-7e41-4b2f-89ca-04396bdce903",
      "chinese_name": "直升机",
      "english_name": "Helicopter",
      "definition": "一种重于空气的航空器，其飞行升力主要由在垂直轴上一个或几个动力驱动的旋翼上的空气反作用取得。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "e1227f37-3c63-49cb-96cd-998d317c06e2",
      "chinese_name": "直升机场",
      "english_name": "Heliport",
      "definition": "全部或部分仅供直升机起飞、着陆和表面活动使用的场地或构筑物上的特定区域。",
      "source": "《民用直升机场飞行场地技术标准》(MH5013-2023)"
    },
    {
      "id": "d204b5d9-f01b-470f-be1d-91d634001cd3",
      "chinese_name": "直升机场运行最低标准",
      "english_name": "Heliport operating minima",
      "definition": "直升机场使用条件的限制：\n对于起飞，用跑道视程和/或能见度以及必要时用云的条件表示；\n对于2D仪表进近着陆运行，用与运行类型相对应的能见度和/或跑道视程、最低下降高度/高（MDA/H）以及必要时用云的条件表示；\n对于3D仪表进近着陆运行，用与运行类型和/或类别相对应的能见度和/或跑道视程以及决断高度/决断高（DA/H）表示。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "69061eae-411b-47e1-9de5-eabc4b0b9914",
      "chinese_name": "直升机起降平台",
      "english_name": "Helideck",
      "definition": "位于浮动或固定近海结构上的直升机场。",
      "source": "《国际民用航空公约》附件6"
    },
    {
      "id": "4de226e4-d0fe-414e-a72a-81e80cdca87d",
      "chinese_name": "直线进近",
      "english_name": "Straight-in approach",
      "definition": "按照仪表飞行规则飞行时，最后进近航迹与着陆跑道中线延长线的夹角在30度以内的仪表进近；按照目视飞行规则飞行时，不经过起落航线其他各边，直接加入第五边而进行着陆。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "0c2083d1-9a2f-4297-9d73-ce678aca7809",
      "chinese_name": "制造符合性",
      "english_name": "Manufacturing conformity",
      "definition": "民用航空产品和零部件的制造、试验、安装等符合经批准的设计。",
      "source": "CCAR-21-R4"
    },
    {
      "id": "6570d349-91f0-4eb7-bc4c-34bc6482dd28",
      "chinese_name": "制造国",
      "english_name": "State of manufacture",
      "definition": "对负责航空器、遥控驾驶站、发动机或螺旋桨最后组装的机构拥有管辖权的国家。",
      "source": "《国际民用航空公约》附件8"
    },
    {
      "id": "695bfd42-7065-4d23-8522-d6eff63314c5",
      "chinese_name": "中断着陆",
      "english_name": "Balked landing",
      "definition": "在低于超障高度/超障高（OCA/H）的任一点意外中止着陆的操作。",
      "source": "《国际民用航空公约》附件14"
    },
    {
      "id": "3425914b-854c-4d96-a83f-7ac9eae03346",
      "chinese_name": "重大风险",
      "english_name": "Major risk",
      "definition": "风险分级评价中被列为“不可接受”的风险，或者被列为“缓解后可接受”但相关控制措施多次出现失效的风险。",
      "source": "AC-398-03"
    },
    {
      "id": "f1f11f68-5f01-4ec6-89eb-03d47e70a975",
      "chinese_name": "重于空气的航空器",
      "english_name": "Heavier-than-air aircraft",
      "definition": "任何在飞行中主要从空气动力获得升力的航空器。",
      "source": "《国际民用航空公约》附件7"
    },
    {
      "id": "014597ce-e0e7-44ae-a336-d8c1343f879c",
      "chinese_name": "主旋翼",
      "english_name": "Main rotor",
      "definition": "对旋翼机提供主要升力的旋翼。",
      "source": "FAR-1"
    },
    {
      "id": "e9cfc0f4-7c47-40c4-b3eb-09d4fe6cc1e3",
      "chinese_name": "主运行基地",
      "english_name": "Main operation base",
      "definition": "合格证持有人为满足运行需要，按照适用规则的有关要求设立的主要运行基地。该基地是局方对合格证持有人运行实施批准、监管，以及合格证持有人对自身运行质量、安全和规章符合性进行有效控制的主要场所。",
      "source": "CCAR-141-R3"
    },
    {
      "id": "56b036e7-a4ad-4ee2-8b91-3b70c6fee33d",
      "chinese_name": "资格检查",
      "english_name": "Qualification check",
      "definition": "对受训人的知识和技能是否达到特定工作岗位标准及能否独立上岗工作所进行的考核与评估。",
      "source": "CCAR-70TM-R1"
    },
    {
      "id": "551a9a99-d053-42c1-88d8-146193425784",
      "chinese_name": "自动相关监视",
      "english_name": "Automatic dependent surveillance (ADS)",
      "definition": "一种监视技术，航空器通过数据链将来自机载导航和定位系统的数据自动发出。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "d2122ce1-23f4-45ed-b3bc-aab1bd69243b",
      "chinese_name": "自由气球",
      "english_name": "Free balloon",
      "definition": "无发动机驱动的轻于空气的航空器，靠气体浮力或由机载加热器产生的热空气浮力维持飞行。",
      "source": "CCAR-61-R5"
    },
    {
      "id": "018f511b-f157-49ca-8fb0-d9113bdcdfd5",
      "chinese_name": "自转旋翼机",
      "english_name": "Gyroplane",
      "definition": "一种重于空气的航空器，其飞行的支撑力由一个或多个在基本垂直的轴上自由转动的旋翼上的空气反作用获得。",
      "source": "《国际民用航空公约》附件7"
    },
    {
      "id": "92cec329-0340-4b05-8550-86957c8ab17b",
      "chinese_name": "最大商载",
      "english_name": "Maximum payload",
      "definition": "(a)对于局方在技术规范中已规定最大无油重量的航空器，以最大无油重量减去空机重量、航空器携带的适用设备的重量和运行载重（包括最少机组成员、食物饮料和与这些食物饮料有关的供应品和设备的重量，但不包括可用燃油和滑油）所计算出的最大商载。\n(b)对于其它航空器，以最大审定起飞重量、较小空机重量、较少的机载设备重量和较小的运行必需重量（运行必需重量为最少的燃油、滑油重量和机组成员重量之和）所计算出的最大商载。机组成员、燃油和滑油的重量按照下列方法计算：\n(1)规章要求的机组成员中每一成员的体重：\n(i)男性飞行机组成员按照82千克；\n(ii)女性飞行机组成员按照64千克；\n(iii)男性客舱乘务员按照82千克；\n(iv)女性客舱乘务员按照59千克；\n(v)客舱乘务员不区分性别时，体重平均按照64千克。\n(2)滑油按照157千克或者型号合格审定中规定的重量；\n(3)规章规定的一次飞行运行所需携带最少燃油量。",
      "source": "CCAR-135-R3"
    },
    {
      "id": "a385f448-3382-4a88-9a20-49777932b875",
      "chinese_name": "最低航路高度",
      "english_name": "Minimum enroute altitude (MEA)",
      "definition": "考虑到无线电导航设施信号覆盖范围，在无线电导航设施之间为仪表飞行规则飞行的航空器所规定的能够满足超障余度的最低飞行高度。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "8dd0efb6-ef0d-4a77-ae15-d7086f966dcf",
      "chinese_name": "最低扇区高度",
      "english_name": "Minimum sector altitude (MSA)",
      "definition": "以一个重要点、机场基准点（ARP）或直升机场基准点（HRP）为中心、半径为46千米(25海里)的圆形扇区内，可提供高出所有障碍物至少300米（1000英尺）余度的可用最低高度。",
      "source": "《国际民用航空公约》附件4"
    },
    {
      "id": "caa2473f-2fb4-4df2-ae6d-31d266156478",
      "chinese_name": "最低设备清单",
      "english_name": "Minimum equipment list (MEL)",
      "definition": "是指运营人依据主最低设备清单并考虑到各航空器的构型、运行程序和条件为其运行所编制的设备清单。最低设备清单经局方批准后，允许航空器在规定条件下，所列设备不工作时继续运行。最低设备清单应当遵守相应航空器型号的主最低设备清单，或者比其更为严格。",
      "source": "CCAR-135-R3"
    },
    {
      "id": "af10b078-4ead-45c6-88df-daea207cb038",
      "chinese_name": "最低下降高度/高",
      "english_name": "Minimum descent altitude (MDA) / Minimum descent height (MDH)",
      "definition": "在非精密进近或盘旋进近中规定的高度或高。在这个高度或高，如果没有取得要求的目视参考，应当开始复飞。最低下降高度以平均海平面为基准；最低下降高以机场或跑道入口标高为基准。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "f9e4c12e-5983-4e7c-bf93-851120c60b1c",
      "chinese_name": "最后进近",
      "english_name": "Final approach",
      "definition": "仪表进近程序的一部分。开始于规定的最后进近定位点。",
      "source": "CCAR-93TM-R6"
    },
    {
      "id": "5975a6c1-7d3d-434a-91fe-77e2e779ea22",
      "chinese_name": "最后进近定位点",
      "english_name": "Final approach fix",
      "definition": "仪表进近程序中的一个定位点，最后进近航段由此开始。",
      "source": "《国际民用航空公约》附件4"
    },
    {
      "id": "1a2b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d",
      "chinese_name": "垂直航径角(VPA)",
      "english_name": "vertical path angle (VPA)",
      "definition": "在气压垂直导航(Baro-VNAV)程序中公布的最后进近下降角度。",
      "source": "AC-97-FS-005R1航空器运行目视和仪表飞行程序设计规范"
    },
    {
      "id": "80792617-6ef1-4fa1-b2bd-7e48f6f49d66",
      "chinese_name": "一般高原机场",
      "english_name": null,
      "definition": "海拔高度在 1524 米(5000 英尺)及以上, 但低于 2438 米(8000 英尺)的机场。",
      "source": "AC-121-FS-2015-21R1高原机场运行"
    },
    {
      "id": "2b3c4d5e-6f7a-4b1c-8d2e-3f4a5b6c7d8e",
      "chinese_name": "高高原机场",
      "english_name": null,
      "definition": "海拔高度在 2438 米(8000 英尺)及以上的机场。",
      "source": "AC-121-FS-2015-21R1高原机场运行"
    },
    {
      "id": "3c4d5e6f-7a8b-4c1d-8e2f-3a4b5c6d7e8f",
      "chinese_name": "高原机场",
      "english_name": null,
      "definition": "一般高原机场和高高原机场统称高原机场。",
      "source": "AC-121-FS-2015-21R1高原机场运行"
    },
    {
      "id": "4d5e6f7a-8b9c-4d1e-8f2a-3b4c5d6e7f8a",
      "chinese_name": "高高原机场运行",
      "english_name": null,
      "definition": "合格证持有人以高高原机场为目的地机场或起飞机场的运行。",
      "source": "AC-121-FS-2015-21R1高原机场运行"
    },
    {
      "id": "5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b",
      "chinese_name": "高高原机场运行关键系统",
      "english_name": null,
      "definition": "根据高高原机场运行的特点, 失效会导致危及安全或运行困难的系统。",
      "source": "AC-121-FS-2015-21R1高原机场运行"
    },
    {
      "id": "6f7a8b9c-0d1e-4f1a-8b2c-3d4e5f6a7b8c",
      "chinese_name": "高高原机场运行敏感部件",
      "english_name": null,
      "definition": "指在实施高高原机场运行的航空器上,易受到高高原环境因素的影响,导致其失效的可能性增加,从而危及飞行安全的部件。",
      "source": "AC-121-FS-2015-21R1高原机场运行"
    }
];

const jeppesenDefinitions = require('./jeppesen.js');

module.exports = baseDefinitions.concat(jeppesenDefinitions);