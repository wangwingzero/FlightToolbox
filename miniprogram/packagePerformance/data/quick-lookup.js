var quickLookup = [
  {
    id: 'QL_V1',
    type: 'concept',
    name_zh: '决断速度 V1',
    name_en: 'Decision Speed: V1',
    summary: 'V1 是起飞决断速度，在此速度之前中断起飞可在剩余跑道内安全停下；超过则应继续起飞。',
    formulas: [],
    keywords: ['V1', '决断速度', 'Decision Speed', '起飞'],
    sourceRef: { id: 'B2_2', title: '决断速度 V1' }
  },
  {
    id: 'QL_VR',
    type: 'concept',
    name_zh: '抬轮速度 VR',
    name_en: 'Rotation Speed: VR',
    summary: 'VR 是飞行员开始拉杆使飞机抬头的速度，影响离地距离与尾擦裕度。',
    formulas: [],
    keywords: ['VR', '抬轮速度', 'Rotation'],
    sourceRef: { id: 'B2_3', title: '抬轮速度 VR' }
  },
  {
    id: 'QL_V2',
    type: 'concept',
    name_zh: '起飞安全速度 V2',
    name_en: 'Takeoff Safety Speed: V2',
    summary: 'V2 是 OEI 时在35英尺必须达到的最小爬升速度，保证爬升梯度要求。',
    formulas: ["V2 = k · VS1g"],
    keywords: ['V2', '起飞安全速度', 'Takeoff Safety Speed', 'OEI'],
    sourceRef: { id: 'B2_5', title: '起飞爬升速度 V2' }
  },
  {
    id: 'QL_VAPP',
    type: 'concept',
    name_zh: '最终进近速度 VAPP',
    name_en: 'Final Approach Speed: VAPP',
    summary: 'VAPP 为50英尺越阈值的目标速度，基于 VREF 并按风况修正。',
    formulas: ["VAPP = VREF + ΔVwind"],
    keywords: ['VAPP', '进近速度', 'Approach'],
    sourceRef: { id: 'B3_1', title: '最终进近速度' }
  },
  {
    id: 'QL_VREF',
    type: 'concept',
    name_zh: '参考速度 VREF',
    name_en: 'Reference Speed: VREF',
    summary: 'VREF 为特定着陆形态下的参考速度，常取全形态 VLS。',
    formulas: [],
    keywords: ['VREF', '参考速度', 'Reference'],
    sourceRef: { id: 'B3_2', title: '参考速度' }
  },
  {
    id: 'QL_TOD_TOR_ASD',
    type: 'formula',
    name_zh: 'TOD/TOR/ASD 定义',
    name_en: 'Takeoff Distance / Run / Accelerate-Stop Distance',
    summary: 'TOD、TOR 与 ASD 分别对应距离离地、起飞滑跑与加速-停止距离的审定定义。',
    formulas: [
      "TOD = s_{BR\to 35 ft} (AEO/OEI)",
      "TOR = s_{BR\to LOF} (AEO)",
      "ASD = s_{BR\to V1} + s_{reject}"
    ],
    keywords: ['TOD', 'TOR', 'ASD', '起飞距离', '加速停止'],
    sourceRef: { id: 'C3_1', title: '起飞距离' }
  },
  {
    id: 'QL_GDS',
    type: 'concept',
    name_zh: '绿点速度 GDS',
    name_en: 'Green Dot Speed',
    summary: '绿点速度为干净形态的最佳升阻比速度，用于发动机失效后的最佳滑翔与爬升梯度。',
    formulas: [],
    keywords: ['GDS', '绿点', '最佳升阻比'],
    sourceRef: { id: 'B1_4', title: '绿点速度' }
  },
  {
    id: 'QL_MMR',
    type: 'concept',
    name_zh: '最大航程马赫数 MMR',
    name_en: 'Maximum Range Mach',
    summary: '在 MMR 处单位燃油可飞行最远距离，用于最小燃油消耗巡航。',
    formulas: [],
    keywords: ['MMR', '最大航程', '最大航程马赫数'],
    sourceRef: { id: 'D2_2', title: '最小燃油消耗巡航' }
  },
  {
    id: 'QL_LRC',
    type: 'concept',
    name_zh: '远程巡航 LRC',
    name_en: 'Long Range Cruise',
    summary: '以牺牲约1%航程换取更高巡航速度的速度策略，缩短总时间。',
    formulas: [],
    keywords: ['LRC', '远程巡航', 'Long Range Cruise'],
    sourceRef: { id: 'D2_3', title: '时间限制' }
  },
  {
    id: 'QL_EFP',
    type: 'procedure',
    name_zh: '发动机失效程序 EFP/EOSID',
    name_en: 'Engine Failure Procedure / EOSID',
    summary: '单发失效时的离场航迹与程序，确保越障与受限空域符合性。',
    formulas: [],
    keywords: ['EFP', 'EOSID', 'Engine Failure Procedure', '障碍物越障'],
    sourceRef: { id: 'C8_2', title: '发动机失效程序' }
  },
  {
    id: 'QL_SPEED_OPT',
    type: 'procedure',
    name_zh: '起飞速度优化',
    name_en: 'Takeoff Speed Optimization',
    summary: '通过优化 V1/VR 与 V2/VS 比例确定最大性能起飞重量及限制因素。',
    formulas: [
      "J = f(V1/VR, V2/VS) \to \max MTOW"
    ],
    keywords: ['速度优化', 'V1', 'VR', 'V2', 'VS', 'MTOW'],
    sourceRef: { id: 'C5_1', title: '起飞速度优化' }
  },
  {
    id: 'QL_REG_CS25_301',
    type: 'regulation',
    name_zh: 'CS 25.301 载荷',
    name_en: 'CS 25.301 Loads',
    summary: '结构载荷总体要求，载荷系数 n_max/n_min 的合规依据之一。',
    formulas: [],
    keywords: ['CS 25.301', '载荷', 'Loads'],
    sourceRef: { id: 'A1_1', title: '载荷系数' }
  }
];

module.exports = quickLookup;
