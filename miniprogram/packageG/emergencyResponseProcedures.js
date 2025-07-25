// 航空器应急响应操作方法表数据
// 数据来源：中国东方航空《危险品操作速查指南 2025.01》
// 提取部分：航空器应急响应操作方法表 (P14-15)

var emergencyResponseProcedures = [
  {
    "code": 1,
    "inherent_hazard": "爆炸可能引起结构破损",
    "aircraft_hazard": "起火和/或爆炸",
    "occupant_hazard": "操作方法字母所指出的危险",
    "spill_leak_procedure": "使用100%氧气；禁止吸烟",
    "fire_fighting_procedure": "使用所有可用的灭火剂；使用标准灭火程序",
    "other_considerations": "可能突然失去增压"
  },
  {
    "code": 2,
    "inherent_hazard": "气体、非易燃，压力可能在火中产生危险",
    "aircraft_hazard": "最小",
    "occupant_hazard": "操作方法字母所指出的危险",
    "spill_leak_procedure": "使用100%氧气；对于操作方法字母为“A”“i”或“P”的物品，要建立和保持最大通风量",
    "fire_fighting_procedure": "使用所有可用的灭火剂；使用标准灭火程序",
    "other_considerations": "可能突然失去增压"
  },
  {
    "code": 3,
    "inherent_hazard": "易燃液体或固体",
    "aircraft_hazard": "起火和/或爆炸",
    "occupant_hazard": "烟、烟雾和高温；以及操作方法字母所指出的危险",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量；禁止吸烟；尽可能最少地使用电气设备",
    "fire_fighting_procedure": "使用所有可用的灭火剂；对于操作方法字母为“W”的物品，禁止使用水",
    "other_considerations": "可能突然失去增压"
  },
  {
    "code": 4,
    "inherent_hazard": "当暴露于空气中时，可自动燃烧或发火",
    "aircraft_hazard": "起火和/或爆炸",
    "occupant_hazard": "烟、烟雾和高温；以及操作方法字母所指出的危险",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量",
    "fire_fighting_procedure": "使用所有可用的灭火剂；对于操作方法字母为“W”的物品，禁止使用水",
    "other_considerations": "可能突然失去增压；如果操作方法字母为“F”或“H”，尽可能最少地使用电气设备"
  },
  {
    "code": 5,
    "inherent_hazard": "氧化性物质，可能引燃其他材料，可能在火的高温中爆炸",
    "aircraft_hazard": "起火和/或爆炸、可能的腐蚀损坏",
    "occupant_hazard": "刺激眼睛、鼻子和喉咙；接触造成皮肤损伤",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量",
    "fire_fighting_procedure": "使用所有可用的灭火剂；对于操作方法字母为“W”的物品，禁止使用水",
    "other_considerations": "可能突然失去增压"
  },
  {
    "code": 6,
    "inherent_hazard": "有毒物质*，如果吸入、摄取或被皮肤吸收，可能致命",
    "aircraft_hazard": "被有毒*的液体或固体污染",
    "occupant_hazard": "剧毒，后果可能会延迟发作",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量；不戴手套不可接触",
    "fire_fighting_procedure": "使用所有可用的灭火剂；对于操作方法字母为“W”的物品，禁止使用水",
    "other_considerations": "可能突然失去增压；如果操作方法字母为“F”或“H”，尽可能最少地使用电气设备"
  },
  {
    "code": 7,
    "inherent_hazard": "从破损的/未防护的包装件中产生的辐射",
    "aircraft_hazard": "被溢出的放射性物质污染",
    "occupant_hazard": "暴露于辐射中，并对人员造成污染",
    "spill_leak_procedure": "不要移动包装件；避免接触",
    "fire_fighting_procedure": "使用所有可用的灭火剂",
    "other_considerations": "请一位有资格的人员接机"
  },
  {
    "code": 8,
    "inherent_hazard": "具有腐蚀性，烟雾如果被吸入或与皮肤接触可致残",
    "aircraft_hazard": "可能造成腐蚀损坏",
    "occupant_hazard": "刺激眼睛、鼻子和喉咙；接触造成皮肤损伤",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量；不戴手套不可接触",
    "fire_fighting_procedure": "使用所有可用的灭火剂；对于操作方法字母为“W”的物品，禁止使用水",
    "other_considerations": "可能突然失去增压；如果操作方法字母为“F”或“H”，尽可能最少地使用电气设备"
  },
  {
    "code": 9,
    "inherent_hazard": "没有一般的固有危险",
    "aircraft_hazard": "操作方法字母所指出的危险",
    "occupant_hazard": "操作方法字母所指出的危险",
    "spill_leak_procedure": "使用100%氧气；对于操作方法字母为“A”的物品，要建立和保持最大通风量",
    "fire_fighting_procedure": "使用所有可用的灭火剂",
    "other_considerations": "无"
  },
  {
    "code": 10,
    "inherent_hazard": "气体、易燃，如果有任何火源，极易着火",
    "aircraft_hazard": "起火和/或爆炸",
    "occupant_hazard": "烟、烟雾和高温；以及操作方法字母所指出的危险",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量；禁止吸烟；尽可能最少地使用电气设备",
    "fire_fighting_procedure": "使用所有可用的灭火剂",
    "other_considerations": "可能突然失去增压"
  },
  {
    "code": 11,
    "inherent_hazard": "感染性物质，如果通过粘膜或外露的伤口吸入、摄取或吸收，可能会对人或动物造成影响。",
    "aircraft_hazard": "被感染性物质污染",
    "occupant_hazard": "对人或动物延迟发作的感染",
    "spill_leak_procedure": "不要接触。在受影响区域保持最低程度的再循环和通风",
    "fire_fighting_procedure": "使用所有可用的灭火剂。对于操作方法字母为“Y”的物品，禁止使用水",
    "other_considerations": "请一位有资格的人员接机"
  },
  {
    "code": 12,
    "inherent_hazard": "火、高温、烟、有毒和易燃蒸气",
    "aircraft_hazard": "起火和/或爆炸",
    "occupant_hazard": "烟、烟雾和高温",
    "spill_leak_procedure": "使用100%氧气；建立和保持最大通风量",
    "fire_fighting_procedure": "使用所有可用的灭火剂。可以使用水（如有）",
    "other_considerations": "可能突然失去增压；考虑立即着陆"
  }
];

// 附加危险表 (用于查询操作方法字母)
var additionalHazards = {
  "A": "有麻醉作用",
  "C": "有腐蚀性",
  "E": "有爆炸性",
  "F": "易燃",
  "H": "高度可燃",
  "i": "有刺激性/催泪", // 小写i
  "L": "其他危险低或无",
  "M": "有磁性",
  "N": "有害",
  "P": "有毒 (TOXIC) * (POISON)",
  "S": "自动燃烧或发火",
  "W": "如果潮湿，释放有毒*或易燃气体。",
  "X": "氧化性物质",
  "Y": "根据感染性物质的类别而定，有关国家主管当局可能需要对人员、动物、货物和航空器进行隔离。",
  "Z": "航空器货舱灭火系统可能不能扑灭或抑制火情；考虑立即着陆。"
};
// 注: Toxic 与 poison (有毒) 意思相同。


// 模块化导出
module.exports = {
  emergencyResponseProcedures,
  additionalHazards
};