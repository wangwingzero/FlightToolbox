// 危险品危险性标签与操作标记（文字版）

const hazardLabelsAndMarks = [
  {
    id: 'class-1',
    type: 'class-label',
    group_zh: '第一类 爆炸品 (Class 1)',
    group_en: 'Class 1 Explosives',
    title_zh: '爆炸品危险性标签',
    title_en: 'Explosives Label',
    code: 'RXS / RCX',
    keywords: '爆炸品 RXS RCX',
    note_zh: '用于表示爆炸性物质，常见代码如 RXS（1.4S 安全爆炸品）和 RCX 等。'
  },
  {
    id: 'class-2-1',
    type: 'class-label',
    group_zh: '第二类 气体 · 2.1 易燃气体',
    group_en: 'Class 2 · Division 2.1 Flammable Gas',
    title_zh: '易燃气体标签',
    title_en: 'Flammable Gas Label',
    code: 'RFG',
    keywords: '易燃气体 2.1 RFG',
    note_zh: '表示易燃气体（如丁烷、丙烷等），对应代码 RFG。'
  },
  {
    id: 'class-2-2-3',
    type: 'class-label',
    group_zh: '第二类 气体 · 2.2 / 2.3 非易燃无毒 / 毒性气体',
    group_en: 'Class 2 · Division 2.2 / 2.3 Non-flammable / Toxic Gas',
    title_zh: '非易燃无毒/毒性气体标签',
    title_en: 'Non-flammable / Toxic Gas Label',
    code: 'RNG / RPG',
    keywords: '非易燃无毒气体 毒性气体 2.2 2.3 RNG RPG',
    note_zh: 'RNG 常用于压缩气体，RPG 用于毒性气体标签。'
  },
  {
    id: 'class-3',
    type: 'class-label',
    group_zh: '第三类 易燃液体 (Class 3)',
    group_en: 'Class 3 Flammable Liquids',
    title_zh: '易燃液体标签',
    title_en: 'Flammable Liquid Label',
    code: 'RFL',
    keywords: '易燃液体 3 RFL',
    note_zh: '表示易燃液体，如汽油、煤油等，对应代码 RFL。'
  },
  {
    id: 'class-4-1',
    type: 'class-label',
    group_zh: '第四类 4.1 易燃固体',
    group_en: 'Class 4.1 Flammable Solids',
    title_zh: '易燃固体标签',
    title_en: 'Flammable Solid Label',
    code: 'RFS',
    keywords: '易燃固体 4.1 RFS',
    note_zh: '表示易燃固体，如火柴等，对应代码 RFS。'
  },
  {
    id: 'class-4-2',
    type: 'class-label',
    group_zh: '第四类 4.2 自燃物质',
    group_en: 'Class 4.2 Substances Liable to Spontaneous Combustion',
    title_zh: '自燃物质标签',
    title_en: 'Spontaneously Combustible Label',
    code: 'RSC',
    keywords: '自燃物质 4.2 RSC',
    note_zh: '表示在空气中可自燃的物质，对应代码 RSC。'
  },
  {
    id: 'class-4-3',
    type: 'class-label',
    group_zh: '第四类 4.3 遇水释放易燃气体的物质',
    group_en: 'Class 4.3 Substances Which, in Contact With Water, Emit Flammable Gases',
    title_zh: '遇水释放易燃气体标签',
    title_en: 'Dangerous When Wet Label',
    code: 'RFW',
    keywords: '遇水 易燃气体 4.3 RFW',
    note_zh: '表示遇水可释放易燃气体的物质，对应代码 RFW。'
  },
  {
    id: 'class-5-1',
    type: 'class-label',
    group_zh: '第五类 5.1 氧化剂',
    group_en: 'Class 5.1 Oxidizing Substances',
    title_zh: '氧化剂标签',
    title_en: 'Oxidizer Label',
    code: 'ROX',
    keywords: '氧化剂 5.1 ROX',
    note_zh: '表示可支持燃烧或引燃其他物质的氧化性物质，对应代码 ROX。'
  },
  {
    id: 'class-5-2',
    type: 'class-label',
    group_zh: '第五类 5.2 有机过氧化物',
    group_en: 'Class 5.2 Organic Peroxides',
    title_zh: '有机过氧化物标签',
    title_en: 'Organic Peroxide Label',
    code: 'ROP',
    keywords: '有机过氧化物 5.2 ROP',
    note_zh: '表示有机过氧化物，对应代码 ROP，通常具有强氧化性和不稳定性。'
  },
  {
    id: 'class-6-1',
    type: 'class-label',
    group_zh: '第六类 6.1 毒性物质',
    group_en: 'Class 6.1 Toxic Substances',
    title_zh: '毒性物质标签',
    title_en: 'Toxic Substances Label',
    code: 'RPB',
    keywords: '毒性物质 6.1 RPB',
    note_zh: '表示摄入、吸入或皮肤接触可导致严重危害或死亡的毒性物质，对应代码 RPB。'
  },
  {
    id: 'class-6-2',
    type: 'class-label',
    group_zh: '第六类 6.2 感染性物质',
    group_en: 'Class 6.2 Infectious Substances',
    title_zh: '感染性物质标签',
    title_en: 'Infectious Substances Label',
    code: 'RIS',
    keywords: '感染性物质 6.2 RIS',
    note_zh: '表示含有病原体、可引起人或动物疾病的物质，对应代码 RIS。'
  },
  {
    id: 'class-7-rrw',
    type: 'class-label',
    group_zh: '第七类 放射性物质',
    group_en: 'Class 7 Radioactive Material',
    title_zh: '放射性物质标签：一级白色',
    title_en: 'Radioactive Material Category I – White',
    code: 'RRW',
    keywords: '放射性物质 Category I White RRW',
    note_zh: '放射性物质的最低危险等级标签，一般辐射水平较低。'
  },
  {
    id: 'class-7-rry',
    type: 'class-label',
    group_zh: '第七类 放射性物质',
    group_en: 'Class 7 Radioactive Material',
    title_zh: '放射性物质标签：二/三级黄色',
    title_en: 'Radioactive Material Category II/III – Yellow',
    code: 'RRY',
    keywords: '放射性物质 Category II III Yellow RRY',
    note_zh: '用于表示较高辐射水平的放射性物质，通常标为黄色标签。'
  },
  {
    id: 'class-8',
    type: 'class-label',
    group_zh: '第八类 腐蚀性物质 (Class 8)',
    group_en: 'Class 8 Corrosives',
    title_zh: '腐蚀性物质标签',
    title_en: 'Corrosive Label',
    code: '',
    keywords: '腐蚀性物质 8',
    note_zh: '表示对皮肤、金属或飞机结构具有腐蚀性的物质。'
  },
  {
    id: 'class-9',
    type: 'class-label',
    group_zh: '第九类 杂项危险物质和物品',
    group_en: 'Class 9 Miscellaneous Dangerous Substances and Articles',
    title_zh: '杂项危险物质和物品标签',
    title_en: 'Miscellaneous Dangerous Goods Label',
    code: 'RCM / RMD',
    keywords: '杂项危险物质 9 RCM RMD 环境危害',
    note_zh: '包括环境危害物质在内的杂项危险品，对应代码如 RCM、RMD。'
  },
  {
    id: 'label-lithium-battery',
    type: 'mark',
    group_zh: '第九类 锂电池/钠离子电池',
    group_en: 'Class 9 Lithium or Sodium Ion Batteries',
    title_zh: '锂电池或钠离子电池标签',
    title_en: 'Lithium Batteries or Sodium Ion Batteries Label',
    code: '',
    keywords: '锂电池 钠离子电池 lithium batteries sodium ion',
    note_zh: '用于标识含有锂电池或钠离子电池的包装，提示存在热失控、火灾等风险。'
  },
  {
    id: 'label-cao',
    type: 'mark',
    group_zh: '操作标签',
    group_en: 'Handling Label',
    title_zh: '仅限货机 (CAO) 标签',
    title_en: 'Cargo Aircraft Only Label',
    code: 'CAO',
    keywords: '仅限货机 CAO Cargo Aircraft Only',
    note_zh: '表示该包装仅允许在货机上运输，禁止装载在客机上。'
  },
  {
    id: 'label-mag',
    type: 'mark',
    group_zh: '操作标签',
    group_en: 'Handling Label',
    title_zh: '磁性物质标签',
    title_en: 'Magnetized Material Label',
    code: 'MAG',
    keywords: '磁性物质 MAG',
    note_zh: '用于标识可能影响飞机仪表的磁性物质，如强磁铁等。'
  },
  {
    id: 'label-rcl',
    type: 'mark',
    group_zh: '低温液体',
    group_en: 'Cryogenic Liquids',
    title_zh: '深冷液化气体（低温液体）标签',
    title_en: 'Cryogenic Liquid Label',
    code: 'RCL',
    keywords: '深冷液化气体 低温液体 RCL',
    note_zh: '用于标识深冷液化气体（如液氮、液氧等），提示存在极低温与窒息风险。'
  },
  {
    id: 'label-excepted-radioactive',
    type: 'mark',
    group_zh: '放射性物质',
    group_en: 'Radioactive Material',
    title_zh: '放射性物质—例外包装件标签',
    title_en: 'Radioactive Material – Excepted Package Label',
    code: '',
    keywords: '放射性物质 例外包装',
    note_zh: '用于辐射水平较低、符合例外包装条件的放射性物质。'
  },
  {
    id: 'label-orientation',
    type: 'mark',
    group_zh: '操作标签',
    group_en: 'Handling Label',
    title_zh: '包装方向性标签',
    title_en: 'Package Orientation Label',
    code: '↑↑',
    keywords: '方向性 标签 This way up',
    note_zh: '提示包装件应保持竖直方向装载和搬运，防止泄漏或损坏。'
  },
  {
    id: 'label-keep-away-from-heat',
    type: 'mark',
    group_zh: '操作标签',
    group_en: 'Handling Label',
    title_zh: '远离热源标签',
    title_en: 'Keep Away From Heat Label',
    code: '',
    keywords: '远离热源 Keep Away From Heat',
    note_zh: '提示货物应远离热源或高温环境，防止因升温引发危险。'
  },
  {
    id: 'label-battery-powered-wheelchair',
    type: 'mark',
    group_zh: '辅助移动设备',
    group_en: 'Mobility Aid',
    title_zh: '电池驱动轮椅/辅助移动设备标签',
    title_en: 'Battery-Powered Wheelchair / Mobility Aid Label',
    code: '',
    keywords: '电池驱动轮椅 辅助移动设备',
    note_zh: '用于标识采用电池驱动的轮椅或辅助移动设备，提醒有电池相关风险。'
  },
  {
    id: 'mark-limited-quantities',
    type: 'mark',
    group_zh: '包装标记',
    group_en: 'Package Mark',
    title_zh: '限制数量包装件标记',
    title_en: 'Limited Quantities Mark',
    code: '',
    keywords: '限制数量 Limited Quantities',
    note_zh: '用于符合“限制数量”条件的危险品包装件，表明已按相应减量要求包装。'
  },
  {
    id: 'mark-excepted-quantities',
    type: 'mark',
    group_zh: '包装标记',
    group_en: 'Package Mark',
    title_zh: '例外数量包装件标记',
    title_en: 'Excepted Quantity Package Mark',
    code: '',
    keywords: '例外数量 Excepted Quantity',
    note_zh: '用于符合“例外数量”要求的小量危险品包装件。'
  },
  {
    id: 'mark-battery',
    type: 'mark',
    group_zh: '包装标记',
    group_en: 'Package Mark',
    title_zh: '电池标记',
    title_en: 'Battery Mark',
    code: '',
    keywords: '电池标记 Battery Mark',
    note_zh: '用于标识包含电池但不满足完整危险品运输条件的特定包装。'
  },
  {
    id: 'mark-environmentally-hazardous',
    type: 'mark',
    group_zh: '环境危害物质',
    group_en: 'Environmentally Hazardous Substances',
    title_zh: '环境危害物质标记',
    title_en: 'Environmentally Hazardous Substance Mark',
    code: '',
    keywords: '环境危害 Environmentally Hazardous',
    note_zh: '用于标识对水体或生态环境具有危害的物质。'
  }
];

module.exports = {
  hazardLabelsAndMarks
};
