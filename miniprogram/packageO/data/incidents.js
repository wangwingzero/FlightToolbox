// 民用航空器征候分类数据
// 严格ES5语法 - 禁止使用ES6+特性

var incidentData = {
  metadata: {
    category: 'incidents',
    title: '民用航空器征候',
    definitionKey: 'incident',
    description: '未构成事故但影响或可能影响安全的事件',
    reference: '《民用航空器征候等级划分办法》(民航规〔2021〕25号)',
    lastUpdated: '2024-05-20'
  },

  // 征候分类
  subcategories: [
    {
      id: 'serious_transport_incident',
      name: '运输航空严重征候',
      definitionKey: 'serious_transport_incident',
      description: '具有很高事故发生可能性的征候',
      criteria: '大型飞机公共航空运输承运人执行公共航空运输任务的飞机在运行阶段发生的征候',
      investigation_authority: '民航局或地区管理局',
      reporting_requirement: '立即报告',
      items: [
        {
          code: '3.1',
          title: '危险接近',
          content: '为避免航空器相撞或其他不安全情况，应做出规避动作的危险接近。',
          note: '在程序管制区域，垂直间隔和水平间隔同时小于1/5规定间隔；在雷达/ADS-B管制区域，垂直间隔和水平间隔同时小于规定间隔，且危险指数大于90（含）的飞行冲突。',
          relatedTerms: ['间隔标准', '防撞/规避', '危险指数'],
          examples: ['两机在空中距离过近需紧急避让', '管制员发出紧急转向指令']
        },
        {
          code: '3.2',
          title: '飞行中相撞',
          content: '飞行中，未被定性为事故的相撞。',
          relatedTerms: ['航空器相撞', '空中相撞'],
          examples: ['与无人机等相撞', '轻微擦碰后仍能正常飞行']
        },
        {
          code: '3.3',
          title: '几近发生的可控飞行撞地',
          content: '几近发生的可控飞行撞地。',
          note: '危险指数大于90（含）的情况。',
          relatedTerms: ['可控飞行撞地', '地形警告', '近地'],
          examples: ['危险指数大于90的CFIT事件', '飞行中挂碰障碍物']
        },
        {
          code: '3.4',
          title: '滑行道上中断起飞',
          content: '在滑行道，或未指定、关闭、占用的跑道上中断起飞。',
          relatedTerms: ['中断起飞', '错误跑道', '滑行道'],
          examples: ['误在滑行道上开始起飞滑跑后中断', '在关闭跑道上中断起飞']
        },
        {
          code: '3.5',
          title: '错误跑道起飞',
          content: '在滑行道，或未指定、关闭、占用的跑道上起飞。',
          relatedTerms: ['错误跑道', '非授权起飞'],
          examples: ['误在滑行道上起飞', '在未开放的跑道上起飞']
        },
        {
          code: '3.6',
          title: '错误跑道着陆',
          content: '在滑行道，或未指定、关闭、占用的跑道上着陆或尝试着陆。',
          note: '由于前机超出ATC正常预期占用跑道导致后机中断着陆或进近的情形除外。',
          relatedTerms: ['错误跑道', '非授权着陆'],
          examples: ['仪表进近认错跑道进近，且在决断高度以下复飞', '目视进近认错跑道进近，且在机场标高60米以下复飞']
        },
        {
          code: '3.7',
          title: '起落架收回着陆',
          content: '未被列为事故的任一起落架收回着陆。',
          relatedTerms: ['收轮着陆', '起落架'],
          examples: ['起落架未放到位着陆但未造成严重后果']
        },
        {
          code: '3.8',
          title: '飞行中擦地',
          content: '飞行中，航空器机轮之外的其它部位擦地。',
          note: '除未导致航空器受损的机尾（不含尾橇）擦地和仅擦尾橇且未导致其它部位受损的情况。',
          relatedTerms: ['机尾擦地', '地面接触'],
          examples: ['起飞时机尾擦地', '着陆时发动机短舱擦地']
        },
        {
          code: '3.9',
          title: '性能不足',
          content: '在起飞或初始爬升过程中明显未达到预定性能。',
          relatedTerms: ['起飞性能', '爬升性能'],
          examples: ['起飞滑跑距离异常长', '爬升率严重不足']
        },
        {
          code: '3.10',
          title: '飞行中火灾',
          content: '飞行中，驾驶舱、客舱和货舱起火或冒烟，或发动机起火，即使这些火被扑灭。',
          note: '除个人电子设备锂电池、灯泡、烤箱食物、操纵台滴溅液体、空调管路残留物等特定情况的起火或冒烟。',
          relatedTerms: ['客舱失火', '发动机失火', '货舱失火'],
          examples: ['飞行中起落架舱起火', '机载电子设备起火或冒烟']
        },
        {
          code: '3.11',
          title: '紧急用氧',
          content: '飞行中，需要机组人员紧急使用氧气的情况。',
          note: '座舱高度达到客舱氧气面罩自动脱落触发条件的情况。',
          relatedTerms: ['座舱高度', '氧气面罩', '增压系统'],
          examples: ['座舱高度警告', '客舱氧气面罩自动脱落']
        },
        {
          code: '3.12',
          title: '结构受损或发动机解体',
          content: '未被列为事故的航空器结构受损或发动机解体，包括非包容性涡轮发动机失效。',
          relatedTerms: ['结构损坏', '发动机失效', '非包容性失效'],
          examples: ['发动机叶片断裂穿透机匣', '机身结构严重受损']
        },
        {
          code: '3.13',
          title: '多重系统故障',
          content: '飞行中，严重影响航空器运行的一个或多个系统出现的多重故障。',
          relatedTerms: ['多重故障', '系统失效'],
          examples: ['航空器仅靠备用电源飞行', '飞行中多于一台发动机同时停车']
        },
        {
          code: '3.14',
          title: '机组丧失工作能力',
          content: '飞行中，飞行机组成员丧失工作能力，导致机组配置不满足要求或在关键阶段丧失能力。',
          relatedTerms: ['机组失能', '驾驶员失能'],
          examples: ['机长在起飞阶段突发疾病', '副驾驶在进近时失去意识']
        },
        {
          code: '3.15',
          title: '燃油紧急状态',
          content: '燃油量或燃油分布需要飞行员宣布紧急状态的情况。',
          relatedTerms: ['燃油紧急', '最少油量'],
          examples: ['航空器着陆接地时油量少于紧急油量', '燃油泄漏导致宣布紧急状态']
        },
        {
          code: '3.16',
          title: 'A类跑道侵入',
          content: 'A类跑道侵入。',
          note: '间隔减小以至于双方必需采取极度措施，勉强避免碰撞发生的跑道侵入。',
          relatedTerms: ['跑道侵入', '防撞/规避'],
          examples: ['跑道上两机距离极近需紧急制动', '管制员发出紧急停止指令']
        },
        {
          code: '3.17',
          title: '冲出或偏出跑道',
          content: '起飞或着陆中，冲出、偏出跑道或跑道外接地。',
          relatedTerms: ['跑道冲偏出', '跑道冲出'],
          examples: ['着陆时冲出跑道端', '起飞时偏出跑道边缘']
        },
        {
          code: '3.18',
          title: '操纵困难',
          content: '导致航空器操纵困难的系统故障、天气现象、飞行超出批准的飞行包线或其他情况。',
          relatedTerms: ['操纵困难', '飞行包线'],
          examples: ['飞行中航空器失速', '任一主操纵系统完全失效']
        },
        {
          code: '3.19',
          title: '导航系统失效',
          content: '飞行中，必需的飞行引导与导航冗余系统中一个以上的系统失效。',
          relatedTerms: ['导航失效', '引导系统'],
          examples: ['GPS和惯导同时失效', '多套导航设备故障']
        },
        {
          code: '3.20',
          title: '多人受伤',
          content: '飞行中遇有颠簸或机组操纵等原因导致3（含）人以上人员轻伤。',
          relatedTerms: ['颠簸受伤', '旅客受伤'],
          examples: ['严重颠簸导致多名旅客受伤', '紧急机动导致乘务员受伤']
        },
        {
          code: '3.21',
          title: '其他严重征候',
          content: '类似上述条款的其他事件。',
          examples: ['在不满足条件的跑道上起飞或着陆', '航空器迫降', '飞行中进入积雨云导致受损', '不能保持安全高度', '低于最低运行标准起飞或着陆', '未按规定完成除防冰作业起飞', '飞行中反推意外打开']
        }
      ]
    },
    
    {
      id: 'general_transport_incident',
      name: '运输航空一般征候',
      definitionKey: 'general_transport_incident',
      description: '未构成运输航空严重征候的征候',
      criteria: '严重程度低于严重征候但仍需关注的安全事件',
      investigation_authority: '地区管理局',
      reporting_requirement: '48小时内报告',
      items: [
        {
          code: '4.1',
          title: '一般危险接近',
          content: '为避免航空器相撞或其他不安全情况，应做出规避动作的危险接近。',
          note: '危险指数介于75（含）至90之间的飞行冲突。',
          relatedTerms: ['间隔标准', '危险指数'],
          examples: ['程序管制区域间隔小于1/3但未小于1/5规定间隔']
        },
        {
          code: '4.2',
          title: '可控飞行撞地风险',
          content: '有发生可控飞行撞地风险。',
          note: '危险指数介于75（含）至90之间的情况。',
          relatedTerms: ['可控飞行撞地', '地形警告'],
          examples: ['地形警告但未达到严重征候标准']
        },
        {
          code: '4.3',
          title: '低高度复飞',
          content: '在滑行道或错误跑道上，从较低高度复飞。',
          note: '仪表进近时从机场标高300m至决断高度复飞；目视进近时从机场标高150m至60m复飞。',
          relatedTerms: ['复飞', '错误跑道'],
          examples: ['在关闭跑道上低高度复飞']
        },
        {
          code: '4.4',
          title: '尾橇擦地',
          content: '在起飞、着陆或复飞过程中，在跑道上擦机尾，未导致航空器受损，或仅需维修/更换尾橇。',
          relatedTerms: ['机尾擦地', '跑道接触'],
          examples: ['起飞时轻微尾橇擦地', '着陆接地重擦尾橇']
        },
        {
          code: '4.5',
          title: '地面火灾',
          content: '除飞行中以外的运行阶段，驾驶舱、客舱和货舱起火或冒烟，或发动机起火，即使这些火被扑灭。',
          relatedTerms: ['地面失火', '客舱冒烟'],
          examples: ['地面时货舱冒烟', '推出时APU起火']
        },
        {
          code: '4.6',
          title: '发动机停车',
          content: '飞行中出现任意一台发动机停车/失效或需要关车的情况。',
          relatedTerms: ['发动机关车', '发动机失效'],
          examples: ['单发停车正常着陆', '发动机故障关车']
        },
        {
          code: '4.7',
          title: '机组部分丧失能力',
          content: '飞行中机组成员丧失工作能力，但未达到严重征候标准。',
          relatedTerms: ['机组失能'],
          examples: ['非关键阶段机组成员短暂不适', '超出规定飞行时间限制']
        },
        {
          code: '4.8',
          title: 'B类跑道侵入',
          content: 'B类跑道侵入。',
          note: '间隔缩小至存在显著碰撞可能，只有在关键时刻采取避让措施才能避免碰撞。',
          relatedTerms: ['跑道侵入'],
          examples: ['跑道上出现显著碰撞风险但成功避让']
        },
        {
          code: '4.9',
          title: '起落架未放低高度',
          content: '在着陆过程中，航空器起落架未放到位，且高度下降到机场标高100m（含）以下。',
          relatedTerms: ['起落架', '起落架警告'],
          examples: ['进近中起落架未放但及时发现']
        },
        {
          code: '4.10',
          title: '少数人员受伤',
          content: '飞行中遇有颠簸或机组操纵等原因导致3人以下人员轻伤。',
          relatedTerms: ['颠簸受伤', '轻伤'],
          examples: ['颠簸导致1-2名旅客轻伤']
        },
        {
          code: '4.11',
          title: '平行跑道同时仪表运行时错误程序',
          content: '平行跑道同时仪表运行时，机组没有正确执行离场或者复飞程序导致其他航空器避让，或者管制员错误的离场或复飞指令导致其他航空器避让。',
          relatedTerms: ['平行跑道', '离场程序', '复飞'],
          examples: ['平行跑道操作中错误离场导致避让', '复飞程序错误导致冲突']
        },
        {
          code: '4.12',
          title: '平行跑道进入非侵入区',
          content: '平行跑道同时仪表运行时，航空器进入非侵入区（NTZ），导致其他航空器避让。',
          relatedTerms: ['平行跑道', '非侵入区', 'NTZ'],
          examples: ['进近时误入NTZ区域', '平行跑道间隔不足']
        },
        {
          code: '4.13',
          title: '起飞构型错误',
          content: '航空器未按性能计算结果而设定的起飞构型继续起飞。',
          relatedTerms: ['起飞构型', '性能计算'],
          examples: ['襟翼设置错误继续起飞', '配平设置不当起飞']
        },
        {
          code: '4.14',
          title: '通信中断导致间隔不足',
          content: '区域范围内陆空通信双向联系中断30分钟（含）以上；或双向联系中断20分钟（含）以上，且导致航空器小于规定间隔。进近或者塔台范围内陆空通信双向联系中断3分钟（含）以上，且导致航空器小于规定间隔。',
          relatedTerms: ['通信失效', '间隔丢失'],
          examples: ['通信中断导致高度冲突', '失联期间间隔不足']
        },
        {
          code: '4.15',
          title: '误入特殊空域',
          content: '误入禁区、危险区、限制区、炮射区或误出、入国境。',
          relatedTerms: ['禁区', '限制区', '危险区'],
          examples: ['误入军事禁区', '错误穿越国境']
        },
        {
          code: '4.16',
          title: '迷航',
          content: '迷航。',
          relatedTerms: ['迷航', '位置不确定'],
          examples: ['导航设备故障迷航', '天气原因迷航']
        },
        {
          code: '4.17',
          title: '安全装置未取下起飞',
          content: '未取下操纵面夹板、挂钩、空速管套、静压孔塞或尾撑杆等而起飞。',
          relatedTerms: ['操纵面锁', '空速管套', '安全销'],
          examples: ['忘记取下操纵面夹板起飞', '空速管套未拆除起飞']
        },
        {
          code: '4.18',
          title: '偏离航线导致避让',
          content: '飞偏或飞错进离场航线并导致其他航空器避让。',
          relatedTerms: ['偏离航线', '规避动作'],
          examples: ['进场航线错误导致避让', '离场程序偏差引起冲突']
        },
        {
          code: '4.19',
          title: '部件缺失导致损伤',
          content: '航空器部件缺失、蒙皮揭起，且导致航空器受损。',
          relatedTerms: ['部件丢失', '蒙皮损坏'],
          examples: ['飞行中天线脱落', '蒙皮揭起导致受损']
        },
        {
          code: '4.20',
          title: '轮胎爆破导致损伤',
          content: '轮胎爆破或脱层，导致航空器其他部位受损。',
          relatedTerms: ['轮胎爆破', '轮胎失效'],
          examples: ['轮胎爆破损坏机身', '轮胎脱层影响起落架']
        },
        {
          code: '4.21',
          title: '撞击导致受损',
          content: '飞行中遭雷击、电击、鸟击、冰击、雹击、外来物或其他物体撞击，导致航空器受损。',
          relatedTerms: ['雷击', '鸟击', '外来物'],
          examples: ['鸟击导致发动机受损', '雷击造成电子设备故障']
        },
        {
          code: '4.22',
          title: '地面相撞',
          content: '在飞行中以外的运行阶段，航空器与航空器、设施设备、车辆、人员或其他地面障碍物相撞，导致航空器受损或人员轻伤。',
          relatedTerms: ['地面碰撞', '航空器损坏'],
          examples: ['滑行时与地面设备相撞', '推出时与其他航空器碰撞']
        },
        {
          code: '4.23',
          title: '货物装载问题',
          content: '由于航空器内货物、邮件、行李、集装器等的装载与固定等原因，导致航空器受损，或飞行中超出重心限制。',
          note: '仅导致航空器货舱地板、壁板受损情况除外。',
          relatedTerms: ['货物装载', '载重平衡'],
          examples: ['货物移位导致重心超限', '集装器固定不当']
        },
        {
          code: '4.24',
          title: '载重平衡计算错误',
          content: '航空器载重平衡计算或输入与实际不符，导致飞行中超出重心限制。',
          relatedTerms: ['载重平衡错误', '重心'],
          examples: ['载重计算错误超重心限制', '重心数据输入错误']
        },
        {
          code: '4.25',
          title: '危险品事故',
          content: '危险品破损、溢出、渗漏或包装未能保持完整等情况，导致航空器受损或人员轻伤。',
          relatedTerms: ['危险品', '危险品事故'],
          examples: ['危险品包装破损泄漏', '危险品标记错误']
        },
        {
          code: '4.26',
          title: '客舱设备移动',
          content: '餐车、储物柜等客舱内设施设备滑出或跌落，导致航空器受损或人员轻伤。',
          relatedTerms: ['客舱设备', '厨房设备'],
          examples: ['颠簸中餐车滑出伤人', '储物柜跌落砸伤旅客']
        },
        {
          code: '4.27',
          title: '过载导致受损',
          content: '飞行中由于过载，导致航空器受损。',
          relatedTerms: ['过载损伤', '结构过载'],
          examples: ['颠簸中过载超限受损', '机动过程过载损伤']
        },
        {
          code: '4.28',
          title: '重量超限',
          content: '航空器超过最大允许起飞重量起飞。航空器超过最大允许着陆重量着陆并导致航空器受损。',
          relatedTerms: ['重量限制', '超重运行'],
          examples: ['超重起飞', '超重着陆导致受损']
        },
        {
          code: '4.29',
          title: '失速警告',
          content: '飞行中出现失速警告持续3秒（含）以上（假信号除外）。',
          relatedTerms: ['失速警告', '气动失速'],
          examples: ['低速飞行触发失速警告', '迎角过大失速警告']
        },
        {
          code: '4.30',
          title: '携带异物飞行',
          content: '航空器携带其他物体飞行，导致航空器受损或影响操纵。',
          relatedTerms: ['外来物', '飞行安全'],
          examples: ['起落架舱携带工具飞行', '机身携带异物影响操纵']
        },
        {
          code: '4.31',
          title: '其他一般征候',
          content: '类似上述条款的其他事件。',
          examples: ['航空器进入俯仰角超过+35°或-15°，或坡度超过60°', '发生非指令性安定面配平', '遭遇风切变未按要求中断起飞或复飞']
        }
      ]
    },
    
    {
      id: 'ground_transport_incident',
      name: '运输航空地面征候',
      definitionKey: 'ground_transport_incident',
      description: '处于非运行阶段时发生的导致飞机受损的征候',
      criteria: '大型飞机在机场活动区内非运行阶段发生的征候',
      investigation_authority: '地区管理局',
      reporting_requirement: '48小时内报告',
      items: [
        {
          code: '6.1',
          title: '地面刮碰',
          content: '航空器与航空器、设施设备、车辆、人员或其他地面障碍物刮碰导致航空器受损。',
          relatedTerms: ['地面碰撞', '航空器损坏'],
          examples: ['推出时与廊桥碰撞', '滑行时与其他航空器刮擦']
        },
        {
          code: '6.2',
          title: '非自主移动',
          content: '航空器未依靠自身动力移动，导致自身或其他航空器受损。',
          relatedTerms: ['航空器移动', '牵引事故'],
          examples: ['牵引时航空器溜车', '大风导致航空器移位碰撞']
        },
        {
          code: '6.3',
          title: '加油设施事故',
          content: '加油设施设备起火、爆炸导致航空器受损。',
          relatedTerms: ['燃油失火', '地面设备'],
          examples: ['加油车起火波及航空器', '加油设备爆炸']
        },
        {
          code: '6.4',
          title: '加油作业事故',
          content: '在加油、抽油过程中导致航空器受损或因航油溢出起火、爆炸导致航空器受损。',
          relatedTerms: ['燃油泄漏', '加油事故'],
          examples: ['加油溢出起火', '抽油时管路破裂']
        },
        {
          code: '6.5',
          title: '地面设备事故',
          content: '车辆、设施设备起火、爆炸导致航空器受损。',
          relatedTerms: ['地面设备失火'],
          examples: ['地面电源车起火', '装载设备爆炸']
        },
        {
          code: '6.6',
          title: '机上设备事故',
          content: '航空器自身设备起火，或载运的物品起火、爆炸、外泄导致航空器受损。',
          relatedTerms: ['机上失火', '货物事故'],
          examples: ['APU起火', '货物泄漏腐蚀机体']
        },
        {
          code: '6.7',
          title: '装卸作业事故',
          content: '在装卸货物、行李、邮件、机上供应品和餐食过程中造成航空器受损。',
          relatedTerms: ['装卸事故', '货物装卸'],
          examples: ['装载设备撞击机身', '货物掉落砸坏航空器']
        },
        {
          code: '6.8',
          title: '其他地面征候',
          content: '类似上述条款的其他事件。',
          examples: ['地面维修作业中的受损事件', '特种车辆操作不当导致的损坏']
        }
      ]
    },
    
    {
      id: 'general_aviation_incident',
      name: '通用航空征候',
      definitionKey: 'general_aviation_incident',
      description: '通用航空器在运行阶段发生的征候',
      criteria: '除运输航空以外的民用航空器征候',
      investigation_authority: '地区管理局',
      reporting_requirement: '48小时内报告',
      items: [
        {
          code: '5.1',
          title: '通航触地/水',
          content: '飞行中，挂碰障碍物或起落架机轮（滑橇、尾环、浮筒、防擦装置）之外的任何部位触地/水，导致航空器受损或人员轻伤。',
          relatedTerms: ['障碍物撞击', '地面接触'],
          examples: ['直升机尾桨触地', '水上飞机浮筒外部位触水']
        },
        {
          code: '5.2',
          title: '通航错误跑道起降',
          content: '在滑行道，或未指定、关闭、占用的跑道上起飞或着陆（经批准的直升机运行除外）。',
          relatedTerms: ['错误跑道', '非授权运行'],
          examples: ['误在滑行道起飞', '在关闭跑道着陆']
        },
        {
          code: '5.3',
          title: '通航性能不足',
          content: '在起飞或初始爬升过程中明显未达到预定性能。',
          relatedTerms: ['起飞性能', '爬升性能'],
          examples: ['超重起飞性能不足', '高温高原性能下降']
        },
        {
          code: '5.4',
          title: '起落架未放到着陆',
          content: '在着陆过程中，起落架未放到位，导致航空器受损或人员轻伤。',
          relatedTerms: ['收轮着陆', '航空器损坏']
        },
        {
          code: '5.5',
          title: '飞行中起火',
          content: '飞行中航空器起火，导致航空器受损或人员轻伤。',
          relatedTerms: ['空中失火']
        },
        {
          code: '5.6',
          title: '失去全部电源',
          content: '飞行中失去全部电源。',
          relatedTerms: ['电气失效', '全部电源丢失']
        },
        {
          code: '5.7',
          title: '发动机停车/失效',
          content: '飞行中发动机停车/失效（特定训练科目除外）。',
          relatedTerms: ['发动机失效', '发动机关车']
        },
        {
          code: '5.8',
          title: '驾驶员丧失能力',
          content: '飞行中，单驾驶员或多人制机组中机长在飞行操作岗位丧失工作能力。',
          relatedTerms: ['驾驶员失能']
        },
        {
          code: '5.9',
          title: '冲偏出跑道或跑道外接地',
          content: '冲出、偏出跑道或跑道外接地，导致航空器受损或人员轻伤。',
          relatedTerms: ['跑道冲偏出', '跑道外着陆']
        },
        {
          code: '5.10',
          title: '意外释放负载',
          content: '无意或者作为应急措施有意释放吊挂负载或航空器外部搭载的任何其他负载。',
          relatedTerms: ['外挂载荷', '意外释放']
        },
        {
          code: '5.11',
          title: '主操纵系统失效',
          content: '飞行中航空器的任一主操纵系统完全失效。',
          relatedTerms: ['飞控系统失效']
        },
        {
          code: '5.12',
          title: '颠簸导致损伤',
          content: '飞行中遇颠簸导致航空器受损或人员轻伤。',
          relatedTerms: ['颠簸损伤', '受伤']
        },
        {
          code: '5.13',
          title: '落错机场/跑道',
          content: '落错机场、跑道（临时起降点除外）。',
          relatedTerms: ['错降机场', '错降跑道']
        },
        {
          code: '5.14',
          title: '迫降',
          content: '迫降。',
          relatedTerms: ['迫降']
        },
        {
          code: '5.15',
          title: '无法保持安全高度',
          content: '航空器不能保持安全高度。',
          relatedTerms: ['高度保持失效', '最低安全高度']
        },
        {
          code: '5.16',
          title: '通航通信中断',
          content: '陆空通信双向联系中断大于30分钟（含），并导致调整其他航空器避让等后果（特殊要求除外）。',
          relatedTerms: ['通信失效', '规避动作']
        },
        {
          code: '5.17',
          title: '通航误入特殊空域',
          content: '误入禁区、危险区、限制区、炮射区或误出、入国境。',
          relatedTerms: ['禁区', '限制区']
        },
        {
          code: '5.18',
          title: '安全装置未取下导致操纵困难',
          content: '未取下航空器操纵面夹板、挂钩、空速管套、静压孔塞或尾撑杆等起飞，并导致航空器操纵困难。',
          relatedTerms: ['操纵面锁', '操纵困难']
        },
        {
          code: '5.19',
          title: '通航迷航',
          content: '迷航。',
          relatedTerms: ['迷航']
        },
        {
          code: '5.20',
          title: 'VFR进入IMC',
          content: '按目视飞行规则飞行的航空器长时间进入仪表气象条件。',
          relatedTerms: ['目视进入仪表气象条件']
        },
        {
          code: '5.21',
          title: '直升机进入涡环',
          content: '直升机在高度300米以下进入涡环状态。',
          relatedTerms: ['直升机', '涡环状态']
        },
        {
          code: '5.22',
          title: '进入异常状态',
          content: '飞行中进入急盘旋下降、飘摆、失速状态（特定训练科目除外）。',
          relatedTerms: ['非正常姿态', '失速', '盘旋']
        },
        {
          code: '5.23',
          title: '直升机旋翼颤振',
          content: '直升机空中发生旋翼颤振，导致航空器操纵困难。',
          relatedTerms: ['直升机', '旋翼颤振', '操纵困难']
        },
        {
          code: '5.24',
          title: '部件脱落导致操纵困难',
          content: '飞行中航空器操纵面、发动机整流罩、外部舱门或风档玻璃脱落，蒙皮揭起或张线断裂，导致航空器操纵困难。',
          relatedTerms: ['部件丢失', '操纵困难']
        },
        {
          code: '5.25',
          title: '外载荷操作不当',
          content: '带外载荷飞行，由于操纵不当等原因导致航空器受损或人员轻伤。',
          relatedTerms: ['外挂载荷', '操作不当']
        },
        {
          code: '5.26',
          title: '其他通航征候',
          content: '类似上述条款的其他事件。',
          relatedTerms: ['通用航空安全']
        }
      ]
    }
  ],
  
  // 征候调查要求
  investigation_requirements: {
    serious_incidents: {
      authority: '民航局或地区管理局',
      time_limit: '12个月内完成最终报告',
      international_notification: '需要通知相关国家',
      investigation_team: '专业调查组'
    },
    
    general_incidents: {
      authority: '地区管理局',
      time_limit: '根据复杂程度确定，通常快于严重征候',
      reporting: '形成调查报告',
      follow_up: '跟踪整改措施'
    }
  }
};

// 导出数据（ES5兼容方式）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = incidentData;
}