// 隐含的危险品数据
// 数据来源：中国东方航空《危险品操作速查指南 2025.01》
// 提取部分：隐含的危险品 (P9-11)

const hiddenDangerousGoods = [
  {
    "category_zh": "紧急航材(AOG)部件",
    "category_en": "AIRCRAFT ON GROUND (AOG) SPARES",
    "description": "可能包含多种危险品，具体参见“飞机零备件/飞机设备”。",
    "possible_items": ["参见“飞机零备件/飞机设备”"]
  },
  {
    "category_zh": "飞机零备件/飞机设备",
    "category_en": "AIRCRAFT SPARE PARTS/AIRCRAFT EQUIPMENT",
    "description": "可能含有爆炸品(照明弹或其他烟雾弹)、化学氧气发生器、不能使用的轮胎组件、压缩气体(氧气、二氧化碳、氮气或灭火器)钢瓶、油漆、粘合剂、气溶胶、救生用品、急救包、设备中的燃料、湿电池或锂电池、火柴等。",
    "possible_items": ["爆炸品", "化学氧气发生器", "轮胎组件", "压缩气体钢瓶", "油漆", "粘合剂", "气溶胶", "救生用品", "急救包", "燃料", "湿电池", "锂电池", "火柴"]
  },
  {
    "category_zh": "汽车、汽车部件(轿车、机动车、摩托车)、供应品",
    "category_en": "AUTOMOBILES, AUTOMOBILE PARTS/SUPPLIES",
    "description": "可能含有铁磁性物质、发动机、燃料电池、化油器、燃料箱、湿电池、锂电池、压缩气体、灭火器、含氮震荡/撑杆、气袋、易燃粘胶剂、油漆、塑封剂和溶剂等。",
    "possible_items": ["铁磁性物质", "发动机", "燃料电池", "化油器", "燃料箱", "湿电池", "锂电池", "压缩气体", "灭火器", "含氮震荡/撑杆", "气袋", "易燃粘胶剂", "油漆", "塑封剂", "溶剂"]
  },
  {
    "category_zh": "电池驱动装置/设备",
    "category_en": "BATTERY-POWERED DEVICES/EQUIPMENT",
    "description": "可能含有湿电池或锂电池。",
    "possible_items": ["湿电池", "锂电池"]
  },
  {
    "category_zh": "呼吸器",
    "category_en": "BREATHING APPARATUS",
    "description": "可能有压缩空气或氧气钢瓶、化学氧气发生器或深冷液化氧气。",
    "possible_items": ["压缩空气/氧气钢瓶", "化学氧气发生器", "深冷液化氧气"]
  },
  {
    "category_zh": "野营用具",
    "category_en": "CAMPING EQUIPMENT",
    "description": "可能含有易燃气体(丁烷、丙烷等)、易燃液体(煤油, 汽油等)、易燃固体(六胺、火柴等)或其他危险品。",
    "possible_items": ["易燃气体", "易燃液体", "易燃固体", "火柴"]
  },
  {
    "category_zh": "轿车、轿车部件",
    "category_en": "CARS, CAR PARTS",
    "description": "参见“汽车”(AUTOMOBILES)等。",
    "possible_items": ["参见“汽车”"]
  },
  {
    "category_zh": "化学品",
    "category_en": "CHEMICALS",
    "description": "可能含符合危险品任何标准的物品，尤其是易燃液体、易燃固体、氧化剂、有机过氧化物、毒性或腐蚀性物质。",
    "possible_items": ["易燃液体", "易燃固体", "氧化剂", "有机过氧化物", "毒性物质", "腐蚀性物质"]
  },
  {
    "category_zh": "经营人物资(公司物料)",
    "category_en": "COMAT (COMPANY MATERIALS)",
    "description": "如飞机部件，可能含有旅客服务设备(PSU)中的化学氧气发生器；各种压缩气体，如：氧气、二氧化碳和氮气；气体打火机、气溶胶、灭火器；易燃液体，如：燃油、油漆和粘合剂；腐蚀性物质，如：电池。其他物质，如：照明弾、急救包、救生设备、火柴、磁性物质等。",
    "possible_items": ["化学氧气发生器", "压缩气体", "打火机", "气溶胶", "灭火器", "易燃液体", "腐蚀性物质", "电池", "照明弹", "急救包", "救生设备", "火柴", "磁性物质"]
  },
  {
    "category_zh": "混装货物",
    "category_en": "CONSOLIDATED CONSIGNMENTS (GROUPAGES)",
    "description": "可能含任何被定义为危险品的物品。",
    "possible_items": ["任何危险品"]
  },
  {
    "category_zh": "低温(液体)",
    "category_en": "CRYOGENIC (LIQUID)",
    "description": "指冷冻液化气体，如氩、氦、氖、氮等。",
    "possible_items": ["冷冻液化气体 (氩, 氦, 氖, 氮)"]
  },
  {
    "category_zh": "钢瓶",
    "category_en": "CYLINDERS",
    "description": "可能含有压缩或液化气体。",
    "possible_items": ["压缩气体", "液化气体"]
  },
  {
    "category_zh": "牙科器械",
    "category_en": "DENTAL APPARATUS",
    "description": "可能含易燃树脂或溶剂、压缩或液化气体、汞和放射性物质。",
    "possible_items": ["易燃树脂/溶剂", "压缩/液化气体", "汞", "放射性物质"]
  },
  {
    "category_zh": "诊断标本",
    "category_en": "DIAGNOSTIC SPECIMENS",
    "description": "可能含有感染性物质。",
    "possible_items": ["感染性物质"]
  },
  {
    "category_zh": "潜水设备",
    "category_en": "DIVING EQUIPMENT",
    "description": "可能含压缩气体(空气、氧气等)的钢瓶、高照明度的潜水灯。为安全载运，灯泡或电池必须保持断路。",
    "possible_items": ["压缩气体钢瓶", "高热度潜水灯", "电池"]
  },
  {
    "category_zh": "钻探及采矿设备",
    "category_en": "DRILLING AND MINING EQUIPMENT",
    "description": "可能含爆炸品和/或其他危险品。",
    "possible_items": ["爆炸品"]
  },
  {
    "category_zh": "敞口液氮容器(蒸气容器)",
    "category_en": "DRY SHIPPER (VAPOUR SHIPPER)",
    "description": "可能含有游离液氮。此类包装不论其放置的方向性，只要它允许液氮的释放，则受IATA《DGR》的限制。",
    "possible_items": ["游离液氮"]
  },
  {
    "category_zh": "电器设备/电子设备",
    "category_en": "ELECTRICAL EQUIPMENT/ELECTRONIC EQUIPMENT",
    "description": "可能含有磁性物质，或在开关盒和电子管中含汞，可能含湿电池，锂电池，含有或含过燃料的燃料电池或燃料电池罐。",
    "possible_items": ["磁性物质", "汞", "湿电池", "锂电池", "燃料电池"]
  },
  {
    "category_zh": "电动器械(轮椅、割草机、高尔夫托车等)",
    "category_en": "ELECTRICALLY POWERED APPARATUS",
    "description": "可能装有湿电池，锂电池或含有或含过燃料的燃料电池或燃料电池罐。",
    "possible_items": ["湿电池", "锂电池", "燃料电池"]
  },
  {
    "category_zh": "探险设备",
    "category_en": "EXPEDITIONARY EQUIPMENT",
    "description": "可能含爆炸品(照明弹)、易燃液体(汽油)、易燃气体(丙烷、野营燃气)或其他危险品。",
    "possible_items": ["爆炸品", "易燃液体", "易燃气体"]
  },
  {
    "category_zh": "摄影组或传媒设备",
    "category_en": "FILM CREW OR MEDIA EQUIPMENT",
    "description": "可能含有爆炸性烟火装置、内燃机发电机、湿电池、锂电池、燃料、发热物品等。",
    "possible_items": ["爆炸性烟火", "发电机", "湿电池", "锂电池", "燃料", "发热物品"]
  },
  {
    "category_zh": "冷冻胚胎",
    "category_en": "FROZEN EMBRYOS",
    "description": "可能含有冷冻液化气体或固态二氧化碳(干冰)。",
    "possible_items": ["冷冻液化气体", "干冰"]
  },
  {
    "category_zh": "冷冻水果、蔬菜等",
    "category_en": "FROZEN FRUIT, VEGETABLES, ETC",
    "description": "可能包装在固态二氧化碳(干冰)中。",
    "possible_items": ["干冰"]
  },
  {
    "category_zh": "燃料",
    "category_en": "FUELS",
    "description": "可能含有易燃液体、易燃固体或易燃气体。",
    "possible_items": ["易燃液体", "易燃固体", "易燃气体"]
  },
  {
    "category_zh": "燃料控制装置",
    "category_en": "FUEL CONTROL UNITS",
    "description": "可能含有易燃液体。",
    "possible_items": ["易燃液体"]
  },
  {
    "category_zh": "热气球",
    "category_en": "HOT AIR BALLOON",
    "description": "可能含易燃气体钢瓶、灭火器、内燃机、电池等。",
    "possible_items": ["易燃气体钢瓶", "灭火器", "内燃机", "电池"]
  },
  {
    "category_zh": "家庭用品",
    "category_en": "HOUSEHOLD GOODS",
    "description": "可能含有符合危险品任何标准的物品，包括易燃气体如溶剂型油漆、粘合剂、上光剂、气溶胶、漂白剂，腐蚀性的烤箱或下水道清洗剂、弹药、火柴等。",
    "possible_items": ["易燃液体", "粘合剂", "气溶胶", "漂白剂", "腐蚀性清洗剂", "弹药", "火柴"]
  },
  {
    "category_zh": "仪器",
    "category_en": "INSTRUMENTS",
    "description": "可能包括气压计、血压计、水银开关、整流器、温度计等含有汞的物品。",
    "possible_items": ["汞"]
  },
  {
    "category_zh": "实验室/试验设备",
    "category_en": "LABORATORY/TESTING EQUIPMENT",
    "description": "可能含有符合危险品任何标准的物品，特别是易燃液体、易燃固体、氧化剂、有机过氧化物、毒性或腐蚀性物质，锂电池，压缩气体钢瓶等。",
    "possible_items": ["易燃液体", "易燃固体", "氧化剂", "有机过氧化物", "毒性物质", "腐蚀性物质", "锂电池", "压缩气体钢瓶"]
  },
  {
    "category_zh": "机械部件",
    "category_en": "MACHINERY PARTS",
    "description": "可能含有粘合剂、油漆、密封胶、溶剂、湿电池和锂电池、汞、含压缩或液化气体的钢瓶等。",
    "possible_items": ["粘合剂", "油漆", "密封胶", "溶剂", "湿电池", "锂电池", "汞", "压缩/液化气体钢瓶"]
  },
  {
    "category_zh": "磁铁或类似物",
    "category_en": "MAGNETS AND OTHER ITEMS OF SIMILAR MATERIAL",
    "description": "其单独或累积效应可能符合磁性物质的定义。",
    "possible_items": ["磁性物质"]
  },
  {
    "category_zh": "医疗器械/设备",
    "category_en": "MEDICAL SUPPLIES/EQUIPMENT",
    "description": "可能含有符合危险品任何标准的物品，特别是易燃液体、易燃固体、氧化剂、有机过氧化物、毒性或腐蚀性物质或锂电池。",
    "possible_items": ["易燃液体", "易燃固体", "氧化剂", "有机过氧化物", "毒性物质", "腐蚀性物质", "锂电池"]
  },
  {
    "category_zh": "金属建筑材料、金属栅栏、金属管材",
    "category_en": "METAL CONSTRUCTION MATERIAL, METAL FENCING, METAL PIPING",
    "description": "可能含由于可能影响飞机仪器而需符合特殊装载要求的铁磁性物质。",
    "possible_items": ["铁磁性物质"]
  },
  {
    "category_zh": "旅客行李",
    "category_en": "PASSENGERS BAGGAGE",
    "description": "可能含有符合危险品任何标准的物品。如：烟花，家庭用的易燃液体、腐蚀性的烤箱或下水道清洗剂、易燃气体或液态打火机燃料储罐，或野营炉的气瓶、火柴、弹药、漂白剂、气溶胶等。",
    "possible_items": ["烟花", "易燃液体", "腐蚀性清洗剂", "打火机燃料", "野营气瓶", "火柴", "弹药", "漂白剂", "气溶胶"]
  },
  {
    "category_zh": "药品",
    "category_en": "PHARMACEUTICALS",
    "description": "可能含有符合危险品任何标准的物品，特别是放射性物质、易燃液体、易燃固体、氧化剂、有机过氧化物、毒性或腐蚀性物质。",
    "possible_items": ["放射性物质", "易燃液体", "易燃固体", "氧化剂", "有机过氧化物", "毒性物质", "腐蚀性物质"]
  },
  {
    "category_zh": "摄影器材/设备",
    "category_en": "PHOTOGRAPHIC SUPPLIES/EQUIPMENT",
    "description": "可能含有符合危险品任何标准的物品，特别是热发生装置、易燃液体、易燃固体、氧化剂、有机过氧化物、毒性或腐蚀性物质或锂电池。",
    "possible_items": ["热发生装置", "易燃液体", "易燃固体", "氧化剂", "有机过氧化物", "毒性物质", "腐蚀性物质", "锂电池"]
  },
  {
    "category_zh": "促销物品",
    "category_en": "PROMOTIONAL MATERIAL",
    "description": "参见“旅客行李”(PASSENGERS BAGGAGE)。",
    "possible_items": ["参见“旅客行李”"]
  },
  {
    "category_zh": "赛车或摩托车队设备",
    "category_en": "RACING CAR OR MOTORCYCLE TEAM EQUIPMENT",
    "description": "可能装有发动机，包括燃料电池发动机，化油器或含燃料或残余燃料的油箱、易燃气溶胶、压缩气体钢瓶、硝基甲烷、其他燃料添加剂或湿电池，锂电池等。",
    "possible_items": ["发动机", "燃料电池", "化油器", "燃料箱", "易燃气溶胶", "压缩气体钢瓶", "硝基甲烷", "燃料添加剂", "湿电池", "锂电池"]
  },
  {
    "category_zh": "电冰箱",
    "category_en": "REFRIGERATORS",
    "description": "可能含有液化气体或氨溶液。",
    "possible_items": ["液化气体", "氨溶液"]
  },
  {
    "category_zh": "修理箱",
    "category_en": "REPAIR KITS",
    "description": "可能含有机过氧化物和易燃粘合剂、溶剂型油漆、树脂等。",
    "possible_items": ["有机过氧化物", "易燃粘合剂", "溶剂型油漆", "树脂"]
  },
  {
    "category_zh": "试验样品",
    "category_en": "SAMPLES FOR TESTING",
    "description": "可能含有符合危险品任何标准的物品，特别是感染性物质、易燃液体、易燃固体、氧化剂、有机过氧化物、毒性或腐蚀性物质。",
    "possible_items": ["感染性物质", "易燃液体", "易燃固体", "氧化剂", "有机过氧化物", "毒性物质", "腐蚀性物质"]
  },
  {
    "category_zh": "精液",
    "category_en": "SEMEN",
    "description": "可能用固态二氧化碳(干冰)或冷冻液化气体包装。参见“敞口液氮容器”。",
    "possible_items": ["干冰", "冷冻液化气体"]
  },
  {
    "category_zh": "船舶部件",
    "category_en": "SHIPS' SPARES",
    "description": "可能含有爆炸品(照明弹)，含压缩气体的钢瓶(救生筏)，油漆，锂电池(应急定位发射器)等。",
    "possible_items": ["爆炸品", "压缩气体钢瓶", "油漆", "锂电池"]
  },
  {
    "category_zh": "演出、电影、舞台和特殊效果设备",
    "category_en": "SHOW, MOTION PICTURE, STAGE AND SPECIAL EFFECTS EQUIPMENT",
    "description": "可能含有易燃物质、爆炸品或其他危险品。",
    "possible_items": ["易燃物质", "爆炸品"]
  },
  {
    "category_zh": "运动物品、运动队设备",
    "category_en": "SPORTING GOODS/SPORTS TEAM EQUIPMENT",
    "description": "可能含有压缩气体或液化气体的钢瓶(空气、二氧化碳等)，锂电池，丙烷火炬，急救箱，易燃的粘胶剂，气溶胶等。",
    "possible_items": ["压缩/液化气体钢瓶", "锂电池", "丙烷火炬", "急救箱", "易燃粘胶剂", "气溶胶"]
  },
  {
    "category_zh": "游泳池化学品",
    "category_en": "SWIMMING POOL CHEMICALS",
    "description": "可能含有氧化性或腐蚀性物质。",
    "possible_items": ["氧化性物质", "腐蚀性物质"]
  },
  {
    "category_zh": "电子设备或仪器的开关",
    "category_en": "SWITCHES IN ELECTRICAL EQUIPMENT OR INSTRUMENTS",
    "description": "可能含有汞。",
    "possible_items": ["汞"]
  },
  {
    "category_zh": "工具箱",
    "category_en": "TOOL BOXES",
    "description": "可能含有爆炸品(射钉枪)、压缩气体或气溶胶、易燃气体(丁烷气瓶或焊炬)、易燃粘合剂或油漆、腐蚀性液体，锂电池等。",
    "possible_items": ["爆炸品", "压缩气体/气溶胶", "易燃气体", "易燃粘合剂/油漆", "腐蚀性液体", "锂电池"]
  },
  {
    "category_zh": "焊炬",
    "category_en": "TORCHES",
    "description": "微型焊炬和通用点火器可能含有易燃气体，并配有电子打火器。大型焊炬可能包含安装在易燃气体容器或钢瓶上的焊炬炬头(通常有自动点火开关)。",
    "possible_items": ["易燃气体", "电子打火器"]
  },
  {
    "category_zh": "旅客的无人陪伴行李/私人物品",
    "category_en": "UNACCOMPANIED PASSENGERS BAGGAGE/ PERSONAL EFFECTS",
    "description": "可能含有符合危险品任何标准的物品。如：烟花，家庭用的易燃液体、腐蚀性的烤箱或下水道清洗剂、易燃气体或液态打火机燃料储罐，或野营炉的气瓶、火柴、漂白剂、气溶胶等。(IATA《DGR》2.3 章节不允许的物品)",
    "possible_items": ["烟花", "易燃液体", "腐蚀性清洗剂", "打火机燃料", "野营气瓶", "火柴", "漂白剂", "气溶胶"]
  },
  {
    "category_zh": "疫苗",
    "category_en": "VACCINES",
    "description": "可能包装在固态二氧化碳(干冰)中。",
    "possible_items": ["干冰"]
  }
];

// 模块化导出
module.exports = {
  hiddenDangerousGoods
};