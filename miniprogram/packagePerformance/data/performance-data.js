/**
 * ==================================================================================
 * 飞机性能数据库 - performance-data.js
 * ==================================================================================
 *
 * 📘 数据来源：Getting to Grips With Aircraft Performance v2.0 (Airbus 2025)
 * 📄 源文档路径：/docs/Getting_to_Grips_With_Aircraft_Performance_v2.md
 *
 * ==================================================================================
 * 🤖 给AI的数据提取说明
 * ==================================================================================
 *
 * ### 任务概述
 * 从Markdown文档中提取完整的章节结构，转换为本文件的数据格式。
 *
 * ### 数据结构层级
 * 1. **metadata**: 文档元信息（标题、来源、版本、年份、总页数等）
 * 2. **sections**: 主要章节数组（7个章节：A-G）
 *    - 每个section包含：id, code, title_zh, title_en, page, icon, description
 *    - 每个section包含subsections数组（子章节）
 *    - 每个subsection包含topics数组（具体主题）
 * 3. **appendices**: 附录数组（8个附录）
 *
 * ### 字段说明与提取规则
 *
 * #### Section字段（章节）
 * - `id`: 章节唯一标识，格式：'A', 'B', 'C', 'D', 'E', 'F', 'G'
 * - `code`: 章节代码，同id，格式：'A', 'B', 'C'等
 * - `title_zh`: 中文标题（需要翻译英文标题）
 *   - 示例：'AIRCRAFT LIMITATIONS' → '飞机限制'
 * - `title_en`: 英文标题（直接从文档提取，全大写）
 *   - 示例：'AIRCRAFT LIMITATIONS'
 * - `page`: 章节起始页码（整数）
 * - `icon`: 章节图标（Emoji表情，根据内容选择合适的）
 *   - 建议：限制→⚠️, 速度→✈️, 起飞→🛫, 飞行→🌤️, 故障→⚙️, 着陆→🛬, 燃油→⛽
 * - `description`: 章节简介（提取章节主要内容关键词，用逗号分隔）
 *   - 示例：'载荷系数、结构重量、速度限制、环境包线'
 *
 * #### Subsection字段（子章节）
 * - `id`: 子章节唯一标识，格式：'A1', 'A2', 'B1', 'B2'（章节ID + 序号）
 * - `code`: 子章节代码，格式：'1', '2', '3'（纯数字）
 * - `title_zh`: 中文标题（翻译）
 * - `title_en`: 英文标题（直接提取）
 * - `page`: 子章节起始页码（整数）
 * - `topics`: 主题数组（可选，如果该子章节有更细分的主题）
 *
 * #### Topic字段（主题）
 * - `id`: 主题唯一标识，格式：'A1_1', 'A1_2'（子章节ID + 序号）
 * - `code`: 主题代码，格式：'1.1', '1.2'（包含点号）
 * - `title_zh`: 中文标题
 * - `title_en`: 英文标题
 * - `page`: 主题起始页码
 * - `content`: 主题内容摘要（50-100字，提取关键信息）
 * - `regulations`: 相关适航规章数组（可选）
 *   - 示例：['CS 25.301', 'FAR 25.301', 'CS 25.321']
 * - `keywords`: 关键词数组（用于搜索）
 *   - 中英文都包含，示例：['载荷系数', 'Load Factors', 'n_max', 'n_min']
 * - `subtopics`: 子主题数组（可选，如果还有更细分的内容）
 *
 * #### Appendix字段（附录）
 * - `id`: 附录唯一标识，格式：'APP1', 'APP2'
 * - `code`: 附录代码，格式：'APPENDIX 1', 'APPENDIX 2'
 * - `title_zh`: 中文标题
 * - `title_en`: 英文标题
 * - `page`: 附录起始页码
 * - `icon`: 附录图标（Emoji）
 * - `keywords`: 关键词数组（可选）
 *
 * ### 提取步骤
 *
 * 1. **识别章节标题**
 *    - 从Markdown的标题层级识别（通常是 # 或 ##）
 *    - 章节标题通常全大写，如：'A. AIRCRAFT LIMITATIONS'
 *
 * 2. **提取页码**
 *    - 页码通常在标题后或段落中以 'page 7' 或 'p.7' 形式出现
 *    - 如果无法找到，可按顺序递增估算
 *
 * 3. **提取子章节和主题**
 *    - 子章节通常是 '1.', '2.', '3.' 开头
 *    - 主题通常是 '1.1', '1.2', '1.3' 开头
 *
 * 4. **提取关键词**
 *    - 速度符号：VMO, MMO, VMCG, VMCA, V1, V2, VR等
 *    - 重量符号：MTOW, MLW, MZFW, MTW等
 *    - 专业术语：Load Factors, Stall Speed等
 *    - 同时包含中英文关键词
 *
 * 5. **提取适航规章**
 *    - 查找 'CS 25.xxx' 或 'FAR 25.xxx' 格式的规章编号
 *    - 完整保留格式，如：'CS 25.301'
 *
 * ### 数据完整性要求
 *
 * ✅ **必须包含**：
 * - 所有7个主章节（A-G）
 * - 所有8个附录（APPENDIX 1-8）
 * - 每个章节的所有子章节
 * - 每个主题的关键词和页码
 *
 * ✅ **可选但推荐**：
 * - 主题的content内容摘要
 * - 适航规章引用
 * - 子主题的详细结构
 *
 * ### 数据质量检查
 *
 * 完成后请检查：
 * - [ ] 所有id是否唯一
 * - [ ] 页码是否递增（允许跳页但不能倒退）
 * - [ ] 中英文标题是否都存在
 * - [ ] 关键词数组是否为空
 * - [ ] 总数据量是否合理（预计50-100KB）
 *
 * ==================================================================================
 */

var performanceData = {
  // ==================== 元数据 ====================
  metadata: {
    title: 'Getting to Grips With Aircraft Performance',
    title_zh: '掌握飞机性能',
    source: 'Airbus S.A.S.',
    version: 'v2.0',
    year: '2025',
    copyright: 'AIRBUS COPYRIGHT & EXPORT CONTROL CLASSIFICATION',
    totalSections: 7,
    totalAppendices: 8,
    totalPages: 260,
    lastUpdated: Date.now()
  },

  // ==================== 主要章节 ====================
  sections: [
    // ------------------------ 章节A：飞机限制 ------------------------
    {
      id: 'A',
      code: 'A',
      title_zh: '飞机限制',
      title_en: 'AIRCRAFT LIMITATIONS',
      page: 7,
      icon: '⚠️',
      description: '载荷系数、结构重量、速度限制、环境包线、发动机限制',
      subsections: [
        {
          id: 'A1',
          code: '1',
          title_zh: '飞行限制',
          title_en: 'Flight Limitations',
          page: 7,
          topics: [
            {
              id: 'A1_1',
              code: '1.1',
              title_zh: '载荷系数',
              title_en: 'Load Factors',
              page: 7,
              content: '载荷系数定义了飞机在不同飞行状态下允许的最大和最小加速度限制。根据CS/FAR 25.301和25.321的要求，正常飞行时n_max为+2.5g，n_min为-1.0g。',
              regulations: ['CS 25.301', 'CS 25.321', 'FAR 25.301', 'FAR 25.321'],
              keywords: ['载荷系数', 'Load Factors', 'n_max', 'n_min', 'g力', 'maneuver']
            },
            {
              id: 'A1_2',
              code: '1.2',
              title_zh: '最大速度',
              title_en: 'Maximum Speeds',
              page: 10,
              content: '最大运行速度限制包括VMO（最大运行速度）和MMO（最大运行马赫数），以及特殊情况下的VMBE（最大刹车能量速度）和VTIRE（最大轮胎速度）。',
              regulations: ['CS 25.103', 'FAR 25.103'],
              keywords: ['VMO', 'MMO', '最大速度', 'Maximum Speed', 'VMBE', 'VTIRE'],
              subtopics: [
                { id: 'A1_2_1', code: '1.2.1', title_zh: '最大空速', title_en: 'Maximum Airspeeds', page: 10, keywords: ['VMO', 'MMO', 'VFE', 'VLE', 'VLO', '最大空速'] },
                { id: 'A1_2_2', code: '1.2.2', title_zh: '最大刹车能量速度', title_en: 'Maximum Brake Energy Speed (VMBE)', page: 11, keywords: ['VMBE', '刹车能量', 'Brake Energy'] },
                { id: 'A1_2_3', code: '1.2.3', title_zh: '最大轮胎速度', title_en: 'Maximum Tire Speed (VTIRE)', page: 12, keywords: ['VTIRE', '轮胎速度', 'Tire Speed'] }
              ]
            },
            {
              id: 'A1_3',
              code: '1.3',
              title_zh: '最小速度',
              title_en: 'Minimum Speeds',
              page: 12,
              content: '最小速度限制包括地面最小操纵速度VMCG、空中最小操纵速度VMCA、着陆最小操纵速度VMCL、最小离地速度VMU，以及失速速度VS。',
              keywords: ['VMCG', 'VMCA', 'VMCL', 'VMU', 'VS', '最小速度', 'Minimum Speed'],
              subtopics: [
                { id: 'A1_3_1', code: '1.3.1', title_zh: '地面最小操纵速度', title_en: 'Minimum Control Speed on the Ground (VMCG)', page: 12, keywords: ['VMCG', '地面操纵'] },
                { id: 'A1_3_2', code: '1.3.2', title_zh: '空中最小操纵速度', title_en: 'Minimum Control Speed in the Air (VMCA)', page: 13, keywords: ['VMCA', '空中操纵'] },
                { id: 'A1_3_3', code: '1.3.3', title_zh: '进近和着陆最小操纵速度', title_en: 'Minimum Control Speed during Approach and Landing (VMCL)', page: 13, keywords: ['VMCL', '着陆操纵'] },
                { id: 'A1_3_4', code: '1.3.4', title_zh: '最小离地速度', title_en: 'Minimum Unstick Speed (VMU)', page: 15, keywords: ['VMU', '离地速度'] },
                { id: 'A1_3_5', code: '1.3.5', title_zh: '失速速度', title_en: 'Stall Speed (VS)', page: 16, keywords: ['VS', 'VS1g', 'VSR', '失速', 'Stall'] }
              ]
            }
          ]
        },
        {
          id: 'A2',
          code: '2',
          title_zh: '最大结构重量',
          title_en: 'Maximum Structural Weights',
          page: 19,
          topics: [
            { id: 'A2_1', code: '2.1', title_zh: '飞机重量定义', title_en: 'Aircraft Weight Definitions', page: 19, keywords: ['MTOW', 'MLW', 'MZFW', 'MTW', '重量', 'Weight'], content: '飞机重量限制包括最大起飞重量MTOW、最大着陆重量MLW、最大零油重量MZFW和最大滑行重量MTW。' },
            { id: 'A2_2', code: '2.2', title_zh: '最大结构起飞重量', title_en: 'Maximum Structural Takeoff Weight (MTOW)', page: 20, keywords: ['MTOW', '起飞重量', 'Takeoff Weight'] },
            { id: 'A2_3', code: '2.3', title_zh: '最大结构着陆重量', title_en: 'Maximum Structural Landing Weight (MLW)', page: 21, keywords: ['MLW', '着陆重量', 'Landing Weight'] },
            { id: 'A2_4', code: '2.4', title_zh: '最大零油重量', title_en: 'Maximum Zero Fuel Weight (MZFW)', page: 21, keywords: ['MZFW', '零油重量', 'Zero Fuel Weight'] },
            { id: 'A2_5', code: '2.5', title_zh: '最大滑行重量', title_en: 'Maximum Taxi Weight (MTW)', page: 22, keywords: ['MTW', '滑行重量', 'Taxi Weight'] }
          ]
        },
        { id: 'A3', code: '3', title_zh: '最小结构重量', title_en: 'Minimum Structural Weight', page: 22, topics: [{ id: 'A3_1', code: '3.1', title_zh: '最小重量定义', title_en: 'Minimum Weight', page: 22, keywords: ['最小重量', 'Minimum Weight'], content: '飞机的最小重量由申请人选择，且不能低于设计最小重量或满足各项飞行要求的最低重量。' }] },
        { id: 'A4', code: '4', title_zh: '环境包线', title_en: 'Environmental Envelope', page: 22, topics: [{ id: 'A4_1', code: '4.1', title_zh: '运行环境限制', title_en: 'Operation Environmental Limits', page: 22, keywords: ['环境包线', 'Environmental Envelope', '高度', '温度'], content: '环境包线定义了飞机允许运行的高度和环境温度的极限范围。' }] },
        { id: 'A5', code: '5', title_zh: '发动机限制', title_en: 'Engine Limitations', page: 23, topics: [
            { id: 'A5_1', code: '5.1', title_zh: '推力设置和EGT限制', title_en: 'Thrust Setting and EGT Limitations', page: 23, keywords: ['发动机', 'Engine', 'EGT', '推力', 'Thrust', 'TOGA', 'MCT'], content: '发动机的主要限制是排气温度（EGT）。最大起飞/复飞（TOGA）推力有时间限制（单发10分钟，全发5分钟），最大连续推力（MCT）没有时间限制。' },
            { id: 'A5_2', code: '5.2', title_zh: '起飞推力限制', title_en: 'Takeoff Thrust Limitations', page: 24, keywords: ['起飞推力', 'Takeoff Thrust', '平定推力', 'Flat Rated Thrust'], content: '在特定高度，起飞推力在达到平定温度（Tref）前保持恒定，超过后随温度升高而下降。' }
          ]
        }
      ]
    },
    // ------------------------ 章节B：运行速度 ------------------------
    {
      id: 'B',
      code: 'B',
      title_zh: '运行速度',
      title_en: 'OPERATING SPEEDS',
      page: 25,
      icon: '✈️',
      description: '通用速度、起飞速度、着陆速度、巡航速度',
      subsections: [
        {
          id: 'B1',
          code: '1',
          title_zh: '通用速度',
          title_en: 'Common Speeds',
          page: 25,
          topics: [
            { id: 'B1_1', code: '1.1', title_zh: '最低可选速度', title_en: 'Lowest Selectable Speed: VLS', page: 25, keywords: ['VLS', '最低可选速度', 'Lowest Selectable Speed'], content: 'VLS是飞行中飞行员不应选择的最低速度，通常至少为干净形态和着陆形态下VS1g的1.23倍。' },
            { id: 'B1_2', code: '1.2', title_zh: '最小襟翼速度', title_en: 'Minimum Flaps Speed: F', page: 25, keywords: ['F Speed', '襟翼速度', 'Flaps Speed'] },
            { id: 'B1_3', code: '1.3', title_zh: '最小缝翼速度', title_en: 'Minimum Slats Speed: S', page: 26, keywords: ['S Speed', '缝翼速度', 'Slats Speed'] },
            { id: 'B1_4', code: '1.4', title_zh: '绿点速度', title_en: 'Green Dot Speed: GDS', page: 27, keywords: ['GDS', '绿点速度', 'Green Dot Speed', '最佳升阻比'] },
            { id: 'B1_5', code: '1.5', title_zh: '速度参考系统', title_en: 'Speed Reference System: SRS', page: 27, keywords: ['SRS', '速度参考系统', 'Speed Reference System'] }
          ]
        },
        {
          id: 'B2',
          code: '2',
          title_zh: '起飞速度',
          title_en: 'Takeoff Speeds',
          page: 28,
          topics: [
            { id: 'B2_1', code: '2.1', title_zh: '发动机失效速度', title_en: 'Engine Failure Speed: VEF', page: 28, keywords: ['VEF', '发动机失效速度', 'Engine Failure Speed'] },
            { id: 'B2_2', code: '2.2', title_zh: '决断速度', title_en: 'Decision Speed: V1', page: 28, keywords: ['V1', '决断速度', 'Decision Speed'], content: 'V1是起飞决断速度，在此速度之前中断起飞可以在剩余跑道上安全停止。' },
            { id: 'B2_3', code: '2.3', title_zh: '抬轮速度', title_en: 'Rotation Speed: VR', page: 29, keywords: ['VR', '抬轮速度', 'Rotation Speed'] },
            { id: 'B2_4', code: '2.4', title_zh: '离地速度', title_en: 'Lift Off Speed: VLOF', page: 29, keywords: ['VLOF', '离地速度', 'Lift Off Speed'] },
            { id: 'B2_5', code: '2.5', title_zh: '起飞爬升速度', title_en: 'Takeoff Climb Speed: V2', page: 30, keywords: ['V2', '起飞安全速度', 'Takeoff Safety Speed', 'Takeoff Climb Speed'] },
            { id: 'B2_6', code: '2.6', title_zh: '起飞速度总结', title_en: 'Takeoff Speed Summary', page: 32, keywords: ['起飞速度', 'Takeoff Speed', 'V1', 'VR', 'V2'] }
          ]
        },
        {
          id: 'B3',
          code: '3',
          title_zh: '着陆速度',
          title_en: 'Landing Speeds',
          page: 33,
          topics: [
            { id: 'B3_1', code: '3.1', title_zh: '最终进近速度', title_en: 'Final Approach Speed: VAPP', page: 33, keywords: ['VAPP', '进近速度', 'Approach Speed'], content: 'VAPP是飞机在50英尺高度飞越跑道入口时的目标速度，通常基于VREF并根据风况进行修正。' },
            { id: 'B3_2', code: '3.2', title_zh: '参考速度', title_en: 'Reference Speed: VREF', page: 34, keywords: ['VREF', '参考速度', 'Reference Speed'], content: 'VREF是特定着陆形态下的参考速度，是计算VAPP的基础，通常为全形态下VLS。' },
            { id: 'B3_3', code: '3.3', title_zh: '复飞性能', title_en: 'Go-Around Speed: VAC and VGA', page: 34, keywords: ['VAC', 'VGA', '复飞性能', 'Go-Around Speed'] }
          ]
        },
        {
          id: 'B4',
          code: '4',
          title_zh: '巡航速度',
          title_en: 'Cruise Speeds',
          page: 35,
          topics: [
            { id: 'B4_1', code: '4.1', title_zh: '管理速度', title_en: 'Managed Speed', page: 35, keywords: ['管理速度', 'Managed Speed', 'ECON', 'Cost Index'], content: '管理速度是由FMS根据成本指数（CI）计算出的经济速度，以优化飞行成本。' },
            { id: 'B4_2', code: '4.2', title_zh: '选择速度', title_en: 'Selected Speed', page: 35, keywords: ['选择速度', 'Selected Speed'], content: '选择速度是由飞行员在AFS控制面板上直接设定的速度目标。' }
          ]
        }
      ]
    },
    // ------------------------ 章节C：起飞 ------------------------
    {
      id: 'C',
      code: 'C',
      title_zh: '起飞',
      title_en: 'TAKEOFF',
      page: 36,
      icon: '🛫',
      description: '地面限制, 性能限制, 起飞距离, 起飞航迹, 湿/污染跑道, 减推力起飞, 发动机失效程序',
      subsections: [
        {
          id: 'C1',
          code: '1',
          title_zh: '简介',
          title_en: 'Introduction',
          page: 36,
          topics: [
            {
              id: 'C1_1',
              code: '1.1',
              title_zh: '起飞阶段定义',
              title_en: 'Takeoff Phase Definition',
              page: 36,
              keywords: ['起飞', 'Takeoff', '刹车释放', 'Brake Release', '1500英尺', '爬升', 'Climb'],
              content: '起飞是从刹车释放开始到1500英尺爬升开始的飞行阶段。飞行员必须达到足够的速度和迎角条件以平衡飞机的升力和重力。在地面加速阶段结束时，飞行员向后拉杆开始抬轮，在此阶段保持加速并增加迎角以增加升力，直到地面反作用力逐渐减小至离地。'
            },
            {
              id: 'C1_2',
              code: '1.2',
              title_zh: '发动机失效考虑',
              title_en: 'Engine Failure Consideration',
              page: 36,
              keywords: ['发动机失效', 'Engine Failure', '关键发动机', 'Critical Engine', 'CS 25', 'FAR 25'],
              regulations: ['CS 25', 'FAR 25'],
              content: '性能确定必须考虑地面加速阶段发动机失效的可能性。对于CS/FAR认证的飞机，必须考虑最关键发动机的失效。关键发动机是指其失效对飞机性能或操纵品质影响最不利的发动机。在四发喷气式飞机上，关键发动机是外侧发动机；在空客双发喷气式飞机上，不存在关键发动机。'
            }
          ]
        },
        { id: 'C2', code: '2', title_zh: '地面限制', title_en: 'Ground limitations', page: 37, topics: [
            { id: 'C2_1', code: '2.1', title_zh: '起飞长度', title_en: 'Takeoff Lengths', page: 37, keywords: ['TORA', 'TODA', 'ASDA', 'Stopway', 'Clearway', '跑道长度'] },
            { id: 'C2_2', code: '2.2', title_zh: '公布的起飞距离', title_en: 'Published Takeoff Distances', page: 38, keywords: ['TORA', 'TODA', 'ASDA'] },
            { id: 'C2_3', code: '2.3', title_zh: '离场扇区', title_en: 'Departure Sector', page: 40, keywords: ['起飞扇区', 'Takeoff Funnel', '障碍物', 'Obstacle Clearance'] }
          ]
        },
        { id: 'C3', code: '3', title_zh: '性能限制', title_en: 'Performance limitations', page: 44, topics: [
            { id: 'C3_1', code: '3.1', title_zh: '起飞距离', title_en: 'Takeoff Distances', page: 44, keywords: ['TOD', 'TOR', 'ASD', '起飞距离', '起飞滑跑距离', '加速停止距离'] },
            { id: 'C3_2', code: '3.2', title_zh: '起飞航迹', title_en: 'Takeoff Trajectory', page: 51, keywords: ['起飞航迹', 'Takeoff Flight Path', 'OEI', 'AEO', '爬升梯度', '障碍物越障'] }
          ]
        },
        { id: 'C4', code: '4', title_zh: '影响因素', title_en: 'Factors of influence', page: 67, topics: [
            { id: 'C4_1', code: '4.1', title_zh: '外部参数', title_en: 'External Parameters', page: 67, keywords: ['温度', '气压', '跑道状况', '坡度', '风', 'Temperature', 'Pressure', 'Slope', 'Wind'] },
            { id: 'C4_2', code: '4.2', title_zh: '可选参数', title_en: 'Selected Parameters', page: 72, keywords: ['襟翼设置', 'Flap Setting', 'V1', 'V2'] }
          ]
        },
        { id: 'C5', code: '5', title_zh: '最大性能起飞重量', title_en: 'Maximum Performance Takeoff Weight', page: 74, topics: [
            { id: 'C5_1', code: '5.1', title_zh: '起飞速度优化', title_en: 'Takeoff Speed Optimization', page: 74, keywords: ['速度优化', 'Speed Optimization', 'V1/VR', 'V2/VS'] },
            { id: 'C5_2', code: '5.2', title_zh: '优化过程结果', title_en: 'Result of the Optimization Process', page: 83, keywords: ['MTOW', '优化', 'Optimization'] }
          ]
        },
        { id: 'C6', code: '6', title_zh: '在湿或污染跑道上起飞', title_en: 'Takeoff on Wet or Contaminated Runways', page: 87, topics: [
            { id: 'C6_1', code: '6.1', title_zh: '污染物定义', title_en: 'Definitions of Contaminant', page: 87, keywords: ['污染', 'Contaminant', '水', '雪', '冰', 'Water', 'Snow', 'Ice'] },
            { id: 'C6_2', code: '6.2', title_zh: '跑道状况', title_en: 'Runway Condition', page: 89, keywords: ['跑道状况', 'Runway Condition', '湿', '污染', '干', 'Wet', 'Contaminated', 'Dry'] },
            { id: 'C6_3', code: '6.3', title_zh: '污染物分类和特性', title_en: 'Contaminants Classification and Properties', page: 91, keywords: ['污染物', 'Contaminants', '阻力', '摩擦', 'Drag', 'Friction'] },
            { id: 'C6_4', code: '6.4', title_zh: '对性能的影响', title_en: 'Effect on Performance', page: 93, keywords: ['性能影响', 'Performance Effect', '水滑', 'Aquaplaning', '刹车摩擦'] }
          ]
        },
        { id: 'C7', code: '7', title_zh: '减推力起飞', title_en: 'Reduced Takeoff Thrust', page: 100, topics: [
            { id: 'C7_1', code: '7.1', title_zh: '减推力原理', title_en: 'Principle of Thrust Reduction', page: 100, keywords: ['减推力', 'Thrust Reduction'] },
            { id: 'C7_2', code: '7.2', title_zh: '灵活起飞', title_en: 'Flexible Takeoff', page: 100, keywords: ['灵活温度', 'Flexible Temperature', 'Flex Takeoff', '假定温度'] },
            { id: 'C7_3', code: '7.3', title_zh: '减额定推力起飞', title_en: 'Derated Takeoff', page: 103, keywords: ['减额定推力', 'Derated Takeoff', 'Derate'] }
          ]
        },
        { id: 'C8', code: '8', title_zh: '发动机失效程序的具体指导', title_en: 'Specific Guidance for Engine Failure Procedure', page: 105, topics: [
            { id: 'C8_1', code: '8.1', title_zh: '公布的离场程序', title_en: 'Published Departure Procedure', page: 105, keywords: ['SID', '离场程序', 'Departure Procedure'] },
            { id: 'C8_2', code: '8.2', title_zh: '发动机失效程序', title_en: 'Engine Failure Procedure', page: 105, keywords: ['EFP', 'EOSID', 'Engine Failure Procedure'] }
          ]
        },
        { id: 'C9', code: '9', title_zh: '返场着陆', title_en: 'Return To Land', page: 111, topics: [{ id: 'C9_1', code: '9.1', title_zh: '超重着陆要求', title_en: 'Overweight Landing Requirements', page: 111, keywords: ['返场着陆', 'Return To Land', '超重着陆', 'Overweight Landing', '燃油抛放', 'Fuel Jettisoning'] }] }
      ]
    },
    // ------------------------ 章节D：飞行中性能 ------------------------
    {
      id: 'D',
      code: 'D',
      title_zh: '飞行中性能',
      title_en: 'IN FLIGHT PERFORMANCE',
      page: 114,
      icon: '🌤️',
      description: '爬升, 巡航, 下降/等待, 飞行剖面, 成本指数, 高度优化',
      subsections: [
        { id: 'D1', code: '1', title_zh: '爬升', title_en: 'Climb', page: 114, topics: [
            { id: 'D1_1', code: '1.1', title_zh: '爬升管理', title_en: 'Climb Management', page: 114, keywords: ['爬升', 'Climb', '推力', 'Thrust', '减额定爬升', 'Derated Climb'] },
            { id: 'D1_2', code: '1.2', title_zh: '爬升速度', title_en: 'Climb Speeds', page: 116, keywords: ['爬升速度', 'Climb Speeds', 'ECON', 'Green Dot'] },
            { id: 'D1_3', code: '1.3', title_zh: '客舱爬升', title_en: 'Cabin Climb', page: 118, keywords: ['客舱爬升', 'Cabin Climb', '增压', 'Pressurization'] },
            { id: 'D1_4', code: '1.4', title_zh: '影响因素', title_en: 'Factors of Influence', page: 118, keywords: ['影响因素', '爬升', '高度', '温度', '重量', '风'] }
          ]
        },
        { id: 'D2', code: '2', title_zh: '巡航', title_en: 'Cruise', page: 120, topics: [
            { id: 'D2_1', code: '2.1', title_zh: '燃油消耗定义', title_en: 'Fuel Consumption Definition', page: 120, keywords: ['燃油消耗', 'Fuel Consumption', 'FF', 'SFC', 'SR'] },
            { id: 'D2_2', code: '2.2', title_zh: '最小燃油消耗巡航', title_en: 'Cruise at Minimum Fuel Consumption', page: 122, keywords: ['最大航程', 'Maximum Range', 'MMR', 'LRC'] },
            { id: 'D2_3', code: '2.3', title_zh: '时间限制', title_en: 'Time Constraints', page: 124, keywords: ['远程巡航', 'Long Range Cruise', 'LRC'] },
            { id: 'D2_4', code: '2.4', title_zh: '最小成本巡航', title_en: 'Cruise at Minimum Cost', page: 126, keywords: ['成本指数', 'Cost Index', 'CI', 'ECON Mach'] },
            { id: 'D2_5', code: '2.5', title_zh: '高度优化', title_en: 'Altitude Optimization', page: 128, keywords: ['最佳高度', 'Optimum Altitude', '最大高度', 'Maximum Altitude', '阶梯爬升', 'Step Climb'] }
          ]
        },
        { id: 'D3', code: '3', title_zh: '下降/等待', title_en: 'Descent/Holding', page: 141, topics: [
            { id: 'D3_1', code: '3.1', title_zh: '下降管理', title_en: 'Descent Management', page: 141, keywords: ['下降', 'Descent', '慢车推力', 'Idle Thrust'] },
            { id: 'D3_2', code: '3.2', title_zh: '下降速度', title_en: 'Descent Speeds', page: 141, keywords: ['下降速度', 'Descent Speeds', 'ECON', 'Green Dot'] },
            { id: 'D3_3', code: '3.3', title_zh: '垂直剖面管理', title_en: 'Vertical Profile Management', page: 144, keywords: ['下降顶点', 'Top of Descent', 'TOD', '连续下降'] },
            { id: 'D3_4', code: '3.4', title_zh: '等待管理', title_en: 'Holding Management', page: 145, keywords: ['等待', 'Holding', '等待速度', 'Holding Speed'] },
            { id: 'D3_5', code: '3.5', title_zh: '影响因素', title_en: 'Factors of Influence', page: 146, keywords: ['影响因素', '下降', '高度', '温度', '重量', '风'] }
          ]
        }
      ]
    },
    // ------------------------ 章节E：故障飞行性能 ------------------------
    {
      id: 'E',
      code: 'E',
      title_zh: '故障飞行性能',
      title_en: 'IN FLIGHT PERFORMANCE WITH FAILURE',
      page: 148,
      icon: '⚙️',
      description: '发动机失效, 飘降, 释压失效, ETOPS, 航路分析',
      subsections: [
        { id: 'E1', code: '1', title_zh: '发动机失效', title_en: 'Engine Failure', page: 148, topics: [
            { id: 'E1_1', code: '1.1', title_zh: '动力损失造成的问题', title_en: 'Problem Created by Loss of Power', page: 148, keywords: ['发动机失效', '动力损失'] },
            { id: 'E1_2', code: '1.2', title_zh: '通用定义', title_en: 'General Definitions', page: 148, keywords: ['飘降', 'Drift Down', '净航迹', '总航迹'] },
            { id: 'E1_3', code: '1.3', title_zh: '航路越障 - 单发失效', title_en: 'En Route Obstacle Clearance - One Engine Inoperative', page: 150, keywords: ['航路越障', '单发失效', 'OEI', 'Obstacle Clearance'] },
            { id: 'E1_4', code: '1.4', title_zh: '航路越障 - 双发失效', title_en: 'Obstacle Clearance - Two Engines Inoperative', page: 154, keywords: ['航路越障', '双发失效', 'two engines inoperative'] },
            { id: 'E1_5', code: '1.5', title_zh: '空客策略', title_en: 'Airbus Policy', page: 156, keywords: ['标准策略', '障碍物/飘降策略', '固定速度策略'] }
          ]
        },
        { id: 'E2', code: '2', title_zh: '释压失效', title_en: 'Pressurization Failure', page: 157, topics: [
            { id: 'E2_1', code: '2.1', title_zh: '旅客需氧量', title_en: 'Passenger Oxygen Requirement', page: 157, keywords: ['需氧量', 'Oxygen Requirement'] },
            { id: 'E2_2', code: '2.2', title_zh: '氧气系统', title_en: 'Oxygen Systems', page: 158, keywords: ['氧气系统', 'Oxygen Systems', '化学氧', '气态氧'] },
            { id: 'E2_3', code: '2.3', title_zh: '飞行剖面', title_en: 'Flight Profile', page: 159, keywords: ['飞行剖面', 'Flight Profile', '紧急下降'] },
            { id: 'E2_4', code: '2.4', title_zh: '最低飞行高度', title_en: 'Minimum Flight Altitudes', page: 161, keywords: ['MOCA', 'MORA', 'MEA', '最低高度'] }
          ]
        },
        { id: 'E3', code: '3', title_zh: 'ETOPS飞行', title_en: 'ETOPS Flight', page: 161, topics: [
            { id: 'E3_1', code: '3.1', title_zh: '双发飞机 - 60分钟规则', title_en: 'Twin Engine Aircraft - 60 Minute Rule', page: 161, keywords: ['ETOPS', '60分钟规则', 'EDTO'] },
            { id: 'E3_2', code: '3.2', title_zh: 'ETOPS速度策略', title_en: 'ETOPS Speed Strategy', page: 162, keywords: ['ETOPS', '速度策略', '固定速度'] }
          ]
        },
        { id: 'E4', code: '4', title_zh: '航路研究指南', title_en: 'Guidance to Route Studies', page: 163, topics: [
            { id: 'E4_1', code: '4.1', title_zh: '越障 - 发动机失效', title_en: 'Obstacle Clearance - Engine Failure', page: 164, keywords: ['航路研究', '发动机失效', '越障'] },
            { id: 'E4_2', code: '4.2', title_zh: '越障 - 客舱释压失效', title_en: 'Obstacle Clearance - Cabin Pressurization Failure', page: 166, keywords: ['航路研究', '释压失效', '越障'] }
          ]
        }
      ]
    },
    // ------------------------ 章节F：着陆 ------------------------
    {
      id: 'F',
      code: 'F',
      title_zh: '着陆',
      title_en: 'LANDING',
      page: 168,
      icon: '🛬',
      description: '着陆距离, LDA, 所需着陆距离, 实际着陆距离, 复飞性能',
      subsections: [
        {
          id: 'F1',
          code: '1',
          title_zh: '简介',
          title_en: 'Introduction',
          page: 168,
          topics: [
            {
              id: 'F1_1',
              code: '1.1',
              title_zh: '着陆要求概述',
              title_en: 'Landing Requirements Overview',
              page: 168,
              keywords: ['着陆要求', 'Landing Requirements', 'CS 25', 'FAR 25', 'Air OPS', 'FAR 121'],
              regulations: ['CS 25', 'FAR 25', 'Air OPS', 'FAR 121'],
              content: '运营商必须基于飞机认证（CS 25/FAR 25）和运行限制（Air OPS和FAR 121）中定义的运行约束检查着陆要求。在正常运行中，着陆距离通常不是限制因素，大多数情况下在最大着陆重量下的着陆距离都是可实现的。这导致签派期间对着陆检查的重要性降低。'
            },
            {
              id: 'F1_2',
              code: '1.2',
              title_zh: '性能评估的重要性',
              title_en: 'Importance of Performance Assessment',
              page: 168,
              keywords: ['性能评估', 'Performance Assessment', '非正常状态', 'Inoperative Items', '不利条件', 'Adverse Conditions', '复飞限制', 'Go-Around Constraints'],
              content: '然而，在非正常设备状态、不利外部条件或复飞限制的情况下，着陆性能可能会受到显著限制。因此，性能评估对于确保安全运行至关重要。后续章节将描述干跑道、湿跑道和污染跑道的签派和飞行中着陆距离定义。'
            },
            {
              id: 'F1_3',
              code: '1.3',
              title_zh: '参考信息',
              title_en: 'Reference Information',
              page: 168,
              keywords: ['污染物定义', 'Contaminant Definition', '槽纹跑道', 'Grooved Runway', 'PFC跑道', 'PFC Runway'],
              content: '关于污染物定义，请参考起飞章节中的污染物定义部分。关于在槽纹或PFC（多孔摩擦路面）跑道上的运行，请参考起飞章节中相应的运行说明。'
            }
          ]
        },
        { id: 'F2', code: '2', title_zh: '着陆限制', title_en: 'Landing limitations', page: 168, topics: [
            { id: 'F2_1', code: '2.1', title_zh: '可用着陆距离', title_en: 'Landing Distance Available (LDA)', page: 168, keywords: ['LDA', '可用着陆距离', 'Landing Distance Available'] },
            { id: 'F2_2', code: '2.2', title_zh: '签派着陆要求', title_en: 'Dispatch Landing Requirements', page: 170, keywords: ['RLD', '所需着陆距离', 'ALD', '实际着陆距离'] },
            { id: 'F2_3', code: '2.3', title_zh: '飞行中要求 - 到达时着陆距离', title_en: 'In-Flight Requirements - Landing Distance at the Time of Arrival (LDTA)', page: 176, keywords: ['LDTA', 'IFLD', '到达时着陆距离', 'RCAM', 'RWYCC'] },
            { id: 'F2_4', code: '2.4', title_zh: '影响因素', title_en: 'Factors of Influence', page: 179, keywords: ['影响因素', '着陆', '高度', '温度', '风', '坡度'] },
            { id: 'F2_5', code: '2.5', title_zh: '签派与飞行中检查对比', title_en: 'Dispatch vs. In-Flight - Landing Distances Performance Checks', page: 181, keywords: ['签派', '飞行中', 'Dispatch', 'In-Flight'] },
            { id: 'F2_6', code: '2.6', title_zh: '超重着陆要求', title_en: 'Overweight Landing Requirements', page: 181, keywords: ['超重着陆', 'Overweight Landing'] }
          ]
        },
        { id: 'F3', code: '3', title_zh: '复飞限制', title_en: 'Go-Around limitations', page: 181, topics: [
            { id: 'F3_1', code: '3.1', title_zh: '审定的复飞梯度', title_en: 'Certified Go-Around Gradients', page: 181, keywords: ['复飞梯度', 'Go-Around Gradient', '进近爬升', '着陆爬升'] },
            { id: 'F3_2', code: '3.2', title_zh: '运行要求', title_en: 'Operational Requirements', page: 184, keywords: ['公布梯度', 'Missed Approach Gradient', 'PANS-OPS'] },
            { id: 'F3_3', code: '3.3', title_zh: '影响因素', title_en: 'Factors of Influence', page: 191, keywords: ['影响因素', '复飞', '高度', '温度', '形态'] }
          ]
        }
      ]
    },
    // ------------------------ 章节G：燃油规划与管理 ------------------------
    {
      id: 'G',
      code: 'G',
      title_zh: '燃油规划与管理',
      title_en: 'FUEL PLANNING AND MANAGEMENT',
      page: 193,
      icon: '⛽',
      description: 'EASA燃油政策, FAA燃油政策, 航程燃油, 备份燃油, 最终储备燃油',
      subsections: [
        { id: 'G1', code: '1', title_zh: 'EASA - 燃油/能源规划与管理', title_en: 'EASA - Fuel/ energy planning and management', page: 193, topics: [
            { id: 'G1_1', code: '1.1', title_zh: '燃油规划政策', title_en: 'Policy for Fuel/Energy Planning', page: 194, keywords: ['EASA', '燃油规划', '航程燃油', '备降燃油', '最后储备', '额外燃油'] },
            { id: 'G1_2', code: '1.2', title_zh: '燃油管理', title_en: 'Fuel Management', page: 207, keywords: ['EASA', '燃油管理', '最低燃油', 'Mayday Fuel'] }
          ]
        },
        { id: 'G2', code: '2', title_zh: 'FAA - 燃油/能源规划与管理', title_en: 'FAA - Fuel/Energy Planning and Management', page: 210, topics: [
            { id: 'G2_1', code: '2.1', title_zh: '不同运行类型', title_en: 'Different Types of Operations', page: 210, keywords: ['FAA', 'Domestic', 'Flag', 'Supplemental'] },
            { id: 'G2_2', code: '2.2', title_zh: '燃油政策', title_en: 'Fuel Policy', page: 210, keywords: ['FAA', '最低燃油', '航程燃油', '备降燃油', '最后储备'] },
            { id: 'G2_3', code: '2.3', title_zh: '影响燃油量的程序', title_en: 'Procedures with an Impact on Fuel Quantities', page: 217, keywords: ['FAA', '孤立机场', '重新签派', 'ETOPS'] },
            { id: 'G2_4', code: '2.4', title_zh: '燃油管理', title_en: 'Fuel Management', page: 218, keywords: ['FAA', '燃油管理'] }
          ]
        }
      ]
    }
  ],
  // ==================== 附录 ====================
  appendices: [
    { id: 'APP1', code: 'APPENDIX 1', title_zh: '国际标准大气', title_en: 'International Standard Atmosphere (ISA)', page: 219, icon: '🌡️', keywords: ['ISA', 'Standard Atmosphere', '标准大气', 'Temperature', 'Pressure', '温度', '气压'] },
    { id: 'APP2', code: 'APPENDIX 2', title_zh: '飞机运行温度', title_en: 'Temperatures for Aircraft Operations', page: 225, icon: '🌡️', keywords: ['Temperature', 'OAT', 'TAT', 'SAT', '温度', '外界温度'] },
    { id: 'APP3', code: 'APPENDIX 3', title_zh: '高度测量', title_en: 'Altimetry', page: 227, icon: '🧭', keywords: ['Altimetry', 'Pressure Altitude', 'True Altitude', 'QNH', 'QFE', 'Flight Level', '高度测量', '气压高度', '飞行高度层'] },
    { id: 'APP4', code: 'APPENDIX 4', title_zh: '速度', title_en: 'Speeds', page: 239, icon: '💨', keywords: ['IAS', 'CAS', 'TAS', 'GS', 'Mach', '速度', '指示空速', '真空速', '地速'] },
    { id: 'APP5', code: 'APPENDIX 5', title_zh: '飞行力学', title_en: 'Flight Mechanics', page: 243, icon: '⚖️', keywords: ['Lift', 'Drag', 'Thrust', 'Weight', 'Climb Gradient', 'Rate of Climb', '飞行力学', '升力', '阻力', '推力', '重力'] },
    { id: 'APP6', code: 'APPENDIX 6', title_zh: '航空资料汇编', title_en: 'Aeronautical Information Publication', page: 252, icon: '📚', keywords: ['AIP', 'SID', 'STAR', 'eTOD', '航空资料汇编'] },
    { id: 'APP7', code: 'APPENDIX 7', title_zh: 'SNOWTAM运行使用', title_en: 'Use of SNOWTAM in operations', page: 253, icon: '❄️', keywords: ['SNOWTAM', 'RWYCC', 'Runway Condition', 'Contamination', '雪情通告', '跑道状况'] },
    { id: 'APP8', code: 'APPENDIX 8', title_zh: '缩写与符号', title_en: 'Abbreviations and Symbols', page: 257, icon: '🔤', keywords: ['Abbreviations', 'Symbols', 'Acronyms', '缩写', '符号'] }
  ]
};

// ==================== 导出数据 ====================
module.exports = performanceData;