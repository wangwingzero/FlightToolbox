/**
 * ==================================================================================
 * 飞机性能搜索索引 - performance-index.js
 * ==================================================================================
 *
 * 📘 数据来源：Getting to Grips With Aircraft Performance v2.0 (Airbus 2025)
 *
 * ==================================================================================
 * 🤖 给AI的索引生成说明
 * ==================================================================================
 *
 * ### 索引目的
 * 将层级化的章节数据扁平化，生成用于快速搜索的索引数组。
 * 每个可搜索的条目（章节/子章节/主题/附录）都应该有一条索引记录。
 *
 * ### 索引生成规则
 *
 * #### 1. 什么内容需要创建索引？
 * - ✅ 所有章节（sections）
 * - ✅ 所有子章节（subsections）
 * - ✅ 所有主题（topics）
 * - ✅ 所有子主题（subtopics）
 * - ✅ 所有附录（appendices）
 *
 * #### 2. 索引字段说明
 *
 * **必填字段**：
 * - `id`: 唯一标识，与原数据中的id保持一致
 *   - 示例：'A1_1', 'B2_1', 'APP1'
 *
 * - `type`: 条目类型，固定值之一
 *   - 'section': 主章节（A、B、C等）
 *   - 'subsection': 子章节（1、2、3等）
 *   - 'topic': 主题（1.1、1.2等）
 *   - 'subtopic': 子主题（1.2.1、1.2.2等）
 *   - 'appendix': 附录
 *
 * - `section`: 所属章节代码
 *   - 示例：'A', 'B', 'C'
 *
 * - `sectionTitle`: 所属章节标题（中文）
 *   - 示例：'飞机限制', '运行速度'
 *
 * - `code`: 条目代码
 *   - 示例：'1.1', '2.3', 'APPENDIX 1'
 *
 * - `title_zh`: 中文标题（必填）
 *
 * - `title_en`: 英文标题（必填）
 *
 * - `page`: 页码（整数）
 *
 * - `keywords`: 关键词数组（用于搜索匹配）
 *   - 中英文都包含
 *   - 包含专业术语、速度符号、重量符号等
 *   - 示例：['VMO', 'MMO', '最大速度', 'Maximum Speed']
 *
 * **可选字段**：
 * - `regulations`: 适航规章数组
 *   - 示例：['CS 25.301', 'FAR 25.301']
 *
 * - `summary`: 内容摘要（50-100字，用于搜索结果预览）
 *   - 提取关键信息
 *
 * #### 3. 索引生成示例
 *
 * 从 performance-data.js 的层级数据：
 *
 * ```javascript
 * {
 *   id: 'A',
 *   subsections: [
 *     {
 *       id: 'A1',
 *       topics: [
 *         {
 *           id: 'A1_1',
 *           code: '1.1',
 *           title_zh: '载荷系数',
 *           title_en: 'Load Factors',
 *           keywords: ['载荷系数', 'Load Factors', 'n_max'],
 *           regulations: ['CS 25.301']
 *         }
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 * 生成索引：
 *
 * ```javascript
 * [
 *   // 章节索引
 *   {
 *     id: 'A',
 *     type: 'section',
 *     section: 'A',
 *     sectionTitle: '飞机限制',
 *     code: 'A',
 *     title_zh: '飞机限制',
 *     title_en: 'AIRCRAFT LIMITATIONS',
 *     page: 7,
 *     keywords: ['飞机限制', 'AIRCRAFT LIMITATIONS', '载荷', '速度']
 *   },
 *   // 子章节索引
 *   {
 *     id: 'A1',
 *     type: 'subsection',
 *     section: 'A',
 *     sectionTitle: '飞机限制',
 *     code: '1',
 *     title_zh: '飞行限制',
 *     title_en: 'Flight Limitations',
 *     page: 7,
 *     keywords: ['飞行限制', 'Flight Limitations']
 *   },
 *   // 主题索引
 *   {
 *     id: 'A1_1',
 *     type: 'topic',
 *     section: 'A',
 *     sectionTitle: '飞机限制',
 *     code: '1.1',
 *     title_zh: '载荷系数',
 *     title_en: 'Load Factors',
 *     page: 7,
 *     keywords: ['载荷系数', 'Load Factors', 'n_max', 'n_min'],
 *     regulations: ['CS 25.301', 'FAR 25.301'],
 *     summary: '载荷系数定义了飞机在不同飞行状态下允许的最大和最小加速度限制。'
 *   }
 * ]
 * ```
 *
 * #### 4. 关键词提取技巧
 *
 * **从标题提取**：
 * - 中英文标题都拆分为关键词
 * - 示例：'最大运行空速 (VMO)' → ['最大', '运行', '空速', 'VMO', 'Maximum', 'Operating', 'Airspeed']
 *
 * **专业术语识别**：
 * - 速度符号：VMO, MMO, VMCG, VMCA, V1, V2, VR, VREF等
 * - 重量符号：MTOW, MLW, MZFW, MTW等
 * - 规章编号：CS 25.xxx, FAR 25.xxx等
 * - 技术术语：Load Factors, Stall Speed, ISA等
 *
 * **中英文对应**：
 * - 同一概念的中英文都包含
 * - 示例：'载荷系数' 和 'Load Factors' 同时出现
 *
 * #### 5. 索引数量估算
 *
 * 预计完整索引条目数：
 * - 7个主章节 = 7条
 * - 约30-40个子章节 = 30-40条
 * - 约100-150个主题 = 100-150条
 * - 约30-50个子主题 = 30-50条
 * - 8个附录 = 8条
 * - **总计：约200-300条**
 *
 * #### 6. 数据质量检查
 *
 * 生成完索引后检查：
 * - [ ] 所有id是否唯一
 * - [ ] 所有条目是否有keywords数组（不能为空）
 * - [ ] section和sectionTitle是否正确对应
 * - [ ] 页码是否合理（递增，允许跳页）
 * - [ ] 中英文标题是否都存在
 *
 * ==================================================================================
 */

var performanceIndex = [
  // ==================== 章节 A: 飞机限制 ====================
  { id: 'A', type: 'section', section: 'A', sectionTitle: '飞机限制', code: 'A', title_zh: '飞机限制', title_en: 'AIRCRAFT LIMITATIONS', page: 7, keywords: ['飞机限制', 'AIRCRAFT LIMITATIONS', '载荷系数', '结构重量', '速度限制', '环境包线', '发动机限制'], summary: '本章介绍飞机的各种限制，包括载荷、重量、速度、环境和发动机等方面的规定。' },
  { id: 'A1', type: 'subsection', section: 'A', sectionTitle: '飞机限制', code: '1', title_zh: '飞行限制', title_en: 'Flight Limitations', page: 7, keywords: ['飞行限制', 'Flight Limitations', '飞行', 'Flight'], summary: '飞行限制涵盖了载荷系数、最大速度和最小速度等关键参数。' },
  { id: 'A1_1', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '1.1', title_zh: '载荷系数', title_en: 'Load Factors', page: 7, keywords: ['载荷系数', 'Load Factors', 'n_max', 'n_min', 'g力', 'maneuver', '载荷', 'g-force'], regulations: ['CS 25.301', 'CS 25.321', 'FAR 25.301', 'FAR 25.321'], summary: '载荷系数定义了飞机在不同飞行状态下允许的最大和最小加速度限制。根据CS/FAR 25.301和25.321的要求，正常飞行时n_max为+2.5g，n_min为-1.0g。' },
  { id: 'A1_2', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '1.2', title_zh: '最大速度', title_en: 'Maximum Speeds', page: 10, keywords: ['VMO', 'MMO', '最大速度', 'Maximum Speeds', 'VMBE', 'VTIRE', '速度', 'speed'], regulations: ['CS 25.103', 'FAR 25.103'], summary: '最大运行速度限制包括VMO（最大运行速度）和MMO（最大运行马赫数），以及特殊情况下的VMBE（最大刹车能量速度）和VTIRE（最大轮胎速度）。' },
  { id: 'A1_2_1', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.2.1', title_zh: '最大空速', title_en: 'Maximum Airspeeds', page: 10, keywords: ['VMO', 'MMO', 'VFE', 'VLE', 'VLO', '最大空速'], summary: 'VMO/MMO是飞机在任何飞行阶段（爬升、巡航或下降）都不得有意超出的速度。' },
  { id: 'A1_2_2', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.2.2', title_zh: '最大刹车能量速度', title_en: 'Maximum Brake Energy Speed (VMBE)', page: 11, keywords: ['VMBE', '刹车能量', 'Maximum', 'Brake', 'Energy', 'Speed'], summary: 'VMBE是刹车系统能够吸收的最大能量所对应的最大速度，是中断起飞的关键限制之一。' },
  { id: 'A1_2_3', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.2.3', title_zh: '最大轮胎速度', title_en: 'Maximum Tire Speed (VTIRE)', page: 12, keywords: ['VTIRE', '轮胎速度', 'Maximum', 'Tire', 'Speed'], summary: 'VTIRE是轮胎制造商规定的最大地面速度，以防止离心力和热量损坏轮胎结构。' },
  { id: 'A1_3', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '1.3', title_zh: '最小速度', title_en: 'Minimum Speeds', page: 12, keywords: ['VMCG', 'VMCA', 'VMCL', 'VMU', 'VS', '最小速度', 'Minimum Speeds', '失速', 'stall'], summary: '最小速度限制包括地面最小操纵速度VMCG、空中最小操纵速度VMCA、着陆最小操纵速度VMCL、最小离地速度VMU，以及失速速度VS。' },
  { id: 'A1_3_1', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.3.1', title_zh: '地面最小操纵速度', title_en: 'Minimum Control Speed on the Ground (VMCG)', page: 12, keywords: ['VMCG', '地面操纵', 'Minimum', 'Control', 'Speed', 'Ground'], summary: 'VMCG是在起飞滑跑中，当关键发动机失效时，仅用主气动操纵舵面就能保持飞机方向控制的最小校准空速。' },
  { id: 'A1_3_2', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.3.2', title_zh: '空中最小操纵速度', title_en: 'Minimum Control Speed in the Air (VMCA)', page: 13, keywords: ['VMCA', '空中操纵', 'Minimum', 'Control', 'Speed', 'Air'], summary: 'VMCA是在关键发动机失效后，仍能保持直线飞行的最小校准空速，倾斜角不超过5度。' },
  { id: 'A1_3_3', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.3.3', title_zh: '进近和着陆最小操纵速度', title_en: 'Minimum Control Speed during Approach and Landing (VMCL)', page: 13, keywords: ['VMCL', '着陆操纵', 'Minimum', 'Control', 'Speed', 'Landing'], summary: 'VMCL是在进近和着陆过程中，当关键发动机失效时，仍能保持方向控制的最小校准空速。' },
  { id: 'A1_3_4', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.3.4', title_zh: '最小离地速度', title_en: 'Minimum Unstick Speed (VMU)', page: 15, keywords: ['VMU', '离地速度', 'Minimum', 'Unstick', 'Speed'], summary: 'VMU是飞机能够安全离地并继续起飞的最小校准空速。' },
  { id: 'A1_3_5', type: 'subtopic', section: 'A', sectionTitle: '飞机限制', code: '1.3.5', title_zh: '失速速度', title_en: 'Stall Speed (VS)', page: 16, keywords: ['VS', 'VS1g', 'VSR', '失速速度', 'Stall', 'Speed'], summary: '失速速度是当迎角增加到临界值时，升力开始急剧下降的速度。参考失速速度VSR是性能计算的基础。' },
  { id: 'A2', type: 'subsection', section: 'A', sectionTitle: '飞机限制', code: '2', title_zh: '最大结构重量', title_en: 'Maximum Structural Weights', page: 19, keywords: ['最大结构重量', 'Maximum', 'Structural', 'Weights', 'MTOW', 'MLW', 'MZFW'], summary: '最大结构重量定义了飞机在结构上能够承受的最大重量，包括起飞、着陆和零燃油等状态。' },
  { id: 'A2_1', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '2.1', title_zh: '飞机重量定义', title_en: 'Aircraft Weight Definitions', page: 19, keywords: ['重量定义', 'Weight', 'Definitions', 'MTOW', 'MLW', 'MZFW', 'MTW'], summary: '飞机重量限制包括最大起飞重量MTOW、最大着陆重量MLW、最大零油重量MZFW和最大滑行重量MTW。' },
  { id: 'A2_2', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '2.2', title_zh: '最大结构起飞重量', title_en: 'Maximum Structural Takeoff Weight (MTOW)', page: 20, keywords: ['MTOW', '最大起飞重量', 'Maximum', 'Takeoff', 'Weight'], summary: 'MTOW是飞机被允许开始起飞滑跑的最大重量，受结构和性能限制。' },
  { id: 'A2_3', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '2.3', title_zh: '最大结构着陆重量', title_en: 'Maximum Structural Landing Weight (MLW)', page: 21, keywords: ['MLW', '最大着陆重量', 'Maximum', 'Landing', 'Weight'], summary: 'MLW是飞机被允许着陆的最大重量，由着陆冲击载荷决定。' },
  { id: 'A2_4', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '2.4', title_zh: '最大零油重量', title_en: 'Maximum Zero Fuel Weight (MZFW)', page: 21, keywords: ['MZFW', '最大零油重量', 'Maximum', 'Zero', 'Fuel', 'Weight'], summary: 'MZFW是飞机在不含可用燃油情况下的最大允许重量，用于限制机翼根部的弯矩。' },
  { id: 'A2_5', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '2.5', title_zh: '最大滑行重量', title_en: 'Maximum Taxi Weight (MTW)', page: 22, keywords: ['MTW', '最大滑行重量', 'Maximum', 'Taxi', 'Weight'], summary: 'MTW是飞机在地面滑行时的最大允许重量。' },
  { id: 'A3', type: 'subsection', section: 'A', sectionTitle: '飞机限制', code: '3', title_zh: '最小结构重量', title_en: 'Minimum Structural Weight', page: 22, keywords: ['最小结构重量', 'Minimum', 'Structural', 'Weight'], summary: '飞机的最小重量限制，通常由阵风和湍流载荷决定。' },
  { id: 'A3_1', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '3.1', title_zh: '最小重量定义', title_en: 'Minimum Weight', page: 22, keywords: ['最小重量', 'Minimum Weight'], summary: '飞机的最小重量由申请人选择，且不能低于设计最小重量或满足各项飞行要求的最低重量。' },
  { id: 'A4', type: 'subsection', section: 'A', sectionTitle: '飞机限制', code: '4', title_zh: '环境包线', title_en: 'Environmental Envelope', page: 22, keywords: ['环境包线', 'Environmental', 'Envelope', '温度', '高度', 'temperature', 'altitude'], summary: '环境包线定义了飞机允许运行的高度和环境温度的极限范围。' },
  { id: 'A4_1', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '4.1', title_zh: '运行环境限制', title_en: 'Operation Environmental Limits', page: 22, keywords: ['环境包线', 'Environmental Envelope', '高度', '温度'], summary: '环境包线定义了飞机允许运行的高度和环境温度的极限范围。' },
  { id: 'A5', type: 'subsection', section: 'A', sectionTitle: '飞机限制', code: '5', title_zh: '发动机限制', title_en: 'Engine Limitations', page: 23, keywords: ['发动机限制', 'Engine', 'Limitations', 'EGT', 'N1', 'N2', 'Thrust', '推力'], summary: '发动机限制主要涉及排气温度（EGT）、转速（N1/N2）和不同推力等级的使用时间限制。' },
  { id: 'A5_1', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '5.1', title_zh: '推力设置和EGT限制', title_en: 'Thrust Setting and EGT Limitations', page: 23, keywords: ['发动机', 'Engine', 'EGT', '推力', 'Thrust', 'TOGA', 'MCT'], summary: '发动机的主要限制是排气温度（EGT）。最大起飞/复飞（TOGA）推力有时间限制（单发10分钟，全发5分钟），最大连续推力（MCT）没有时间限制。' },
  { id: 'A5_2', type: 'topic', section: 'A', sectionTitle: '飞机限制', code: '5.2', title_zh: '起飞推力限制', title_en: 'Takeoff Thrust Limitations', page: 24, keywords: ['起飞推力', 'Takeoff Thrust', '平定推力', 'Flat Rated Thrust'], summary: '在特定高度，起飞推力在达到平定温度（Tref）前保持恒定，超过后随温度升高而下降。' },
  { id: 'B', type: 'section', section: 'B', sectionTitle: '运行速度', code: 'B', title_zh: '运行速度', title_en: 'OPERATING SPEEDS', page: 25, keywords: ['运行速度', 'OPERATING SPEEDS', 'V1', 'VR', 'V2', 'VREF', 'VAPP', '速度'], summary: '本章详细介绍飞机在起飞、爬升、巡航、进近和着陆等不同飞行阶段使用的关键运行速度。' },
  { id: 'B1', type: 'subsection', section: 'B', sectionTitle: '运行速度', code: '1', title_zh: '通用速度', title_en: 'Common Speeds', page: 25, keywords: ['通用速度', 'Common Speeds', 'VLS', 'F Speed', 'S Speed', 'Green Dot'], summary: '介绍在不同飞行阶段通用的参考速度，如最低可选速度(VLS)、襟缝翼操作速度(F/S)和最佳升阻比速度(Green Dot)。' },
  { id: 'B1_1', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '1.1', title_zh: '最低可选速度', title_en: 'Lowest Selectable Speed: VLS', page: 25, keywords: ['VLS', '最低可选速度', 'Lowest Selectable Speed'], summary: 'VLS是飞行中飞行员不应选择的最低速度，通常至少为干净形态和着陆形态下VS1g的1.23倍。' },
  { id: 'B1_2', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '1.2', title_zh: '最小襟翼速度', title_en: 'Minimum Flaps Speed: F', page: 25, keywords: ['F Speed', '襟翼速度', 'Flaps Speed'], summary: 'F速度是不同飞行阶段收放襟翼的推荐最小速度。' },
  { id: 'B1_3', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '1.3', title_zh: '最小缝翼速度', title_en: 'Minimum Slats Speed: S', page: 26, keywords: ['S Speed', '缝翼速度', 'Slats Speed'], summary: 'S速度是不同飞行阶段收放缝翼的推荐最小速度。' },
  { id: 'B1_4', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '1.4', title_zh: '绿点速度', title_en: 'Green Dot Speed: GDS', page: 27, keywords: ['GDS', '绿点速度', 'Green Dot Speed', '最佳升阻比'], summary: '绿点速度是飞机在干净形态下的最佳升阻比速度，提供了最佳的爬升梯度和最高的飘降高度。' },
  { id: 'B1_5', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '1.5', title_zh: '速度参考系统', title_en: 'Speed Reference System: SRS', page: 27, keywords: ['SRS', '速度参考系统', 'Speed Reference System'], summary: 'SRS是起飞和复飞阶段的自动飞行指引模式，通过控制俯仰角来精确管理速度。' },
  { id: 'B2', type: 'subsection', section: 'B', sectionTitle: '运行速度', code: '2', title_zh: '起飞速度', title_en: 'Takeoff Speeds', page: 28, keywords: ['起飞速度', 'Takeoff', 'Speeds', 'V1', 'VR', 'V2', 'VLOF'], summary: '定义了起飞阶段的关键速度，包括决断速度V1、抬轮速度VR和起飞安全速度V2。' },
  { id: 'B2_1', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '2.1', title_zh: '发动机失效速度', title_en: 'Engine Failure Speed: VEF', page: 28, keywords: ['VEF', '发动机失效速度', 'Engine Failure Speed'], summary: 'VEF是假定关键发动机失效的校准空速，不能小于VMCG。' },
  { id: 'B2_2', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '2.2', title_zh: '决断速度', title_en: 'Decision Speed: V1', page: 28, keywords: ['V1', '决断速度', 'Decision Speed'], summary: 'V1是起飞决断速度，在此速度之前中断起飞可以在剩余跑道上安全停止。' },
  { id: 'B2_3', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '2.3', title_zh: '抬轮速度', title_en: 'Rotation Speed: VR', page: 29, keywords: ['VR', '抬轮速度', 'Rotation Speed'], summary: 'VR是飞行员开始拉杆使飞机抬头的速度。' },
  { id: 'B2_4', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '2.4', title_zh: '离地速度', title_en: 'Lift Off Speed: VLOF', page: 29, keywords: ['VLOF', '离地速度', 'Lift Off Speed'], summary: 'VLOF是飞机主起落架离开地面的校准空速。' },
  { id: 'B2_5', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '2.5', title_zh: '起飞爬升速度', title_en: 'Takeoff Climb Speed: V2', page: 30, keywords: ['V2', '起飞安全速度', 'Takeoff Safety Speed'], summary: 'V2是单发失效后，飞机在35英尺高度必须达到的最小爬升速度，以保证安全的爬升梯度。' },
  { id: 'B2_6', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '2.6', title_zh: '起飞速度总结', title_en: 'Takeoff Speed Summary', page: 32, keywords: ['起飞速度', 'Takeoff Speed', 'V1', 'VR', 'V2', 'VLOF'], summary: '总结了V1, VR, VLOF, V2等起飞速度之间的关系和规定裕度。' },
  { id: 'B3', type: 'subsection', section: 'B', sectionTitle: '运行速度', code: '3', title_zh: '着陆速度', title_en: 'Landing Speeds', page: 33, keywords: ['着陆速度', 'Landing', 'Speeds', 'VAPP', 'VREF'], summary: '定义了着陆阶段的关键速度，包括参考速度VREF和最终进近速度VAPP。' },
  { id: 'B3_1', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '3.1', title_zh: '最终进近速度', title_en: 'Final Approach Speed: VAPP', page: 33, keywords: ['VAPP', '进近速度', 'Final', 'Approach', 'Speed'], summary: 'VAPP是飞机在50英尺高度飞越跑道入口时的目标速度，通常基于VREF并根据风况进行修正。' },
  { id: 'B3_2', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '3.2', title_zh: '参考速度', title_en: 'Reference Speed: VREF', page: 34, keywords: ['VREF', '参考速度', 'Reference', 'Speed', 'landing'], summary: 'VREF是特定着陆形态下的参考速度，是计算VAPP的基础，通常为全形态下VLS。' },
  { id: 'B3_3', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '3.3', title_zh: '复飞速度', title_en: 'Go-Around Speed: VAC and VGA', page: 34, keywords: ['VAC', 'VGA', '复飞速度', 'Go-Around Speed'], summary: 'VAC (V2GA)是单发复飞的目标爬升速度，VGA是全发复飞的爬升速度。' },
  { id: 'B4', type: 'subsection', section: 'B', sectionTitle: '运行速度', code: '4', title_zh: '巡航速度', title_en: 'Cruise Speeds', page: 35, keywords: ['巡航速度', 'Cruise', 'Speeds', 'ECON', 'Managed', 'Selected'], summary: '巡航速度可以是飞行员选择的固定速度，也可以是由FMS根据成本指数计算出的经济速度（ECON）。' },
  { id: 'B4_1', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '4.1', title_zh: '管理速度', title_en: 'Managed Speed', page: 35, keywords: ['管理速度', 'Managed Speed', 'ECON', 'Cost Index'], summary: '管理速度是由FMS根据成本指数（CI）计算出的经济速度，以优化飞行成本。' },
  { id: 'B4_2', type: 'topic', section: 'B', sectionTitle: '运行速度', code: '4.2', title_zh: '选择速度', title_en: 'Selected Speed', page: 35, keywords: ['选择速度', 'Selected Speed'], summary: '选择速度是由飞行员在AFS控制面板上直接设定的速度目标。' },
  { id: 'C', type: 'section', section: 'C', sectionTitle: '起飞', code: 'C', title_zh: '起飞', title_en: 'TAKEOFF', page: 36, keywords: ['起飞', 'TAKEOFF', '起飞距离', 'TORA', 'TODA', 'ASDA', '性能限制', '减推力'], summary: '本章全面介绍起飞性能的计算，包括跑道限制、性能限制、各种影响因素以及特殊情况下的操作。' },
  { id: 'C1', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '1', title_zh: '简介', title_en: 'Introduction', page: 36, keywords: ['起飞', '简介', 'Takeoff', 'Introduction'], summary: '起飞阶段定义、发动机失效考虑和关键发动机概念。' },
  { id: 'C1_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '1.1', title_zh: '起飞阶段定义', title_en: 'Takeoff Phase Definition', page: 36, keywords: ['起飞', 'Takeoff', '刹车释放', 'Brake Release', '1500英尺', '爬升', 'Climb', '抬轮', 'Rotation', '离地', 'Liftoff'], summary: '起飞是从刹车释放开始到1500英尺爬升开始的飞行阶段。飞行员必须达到足够的速度和迎角条件以平衡升力和重力。' },
  { id: 'C1_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '1.2', title_zh: '发动机失效考虑', title_en: 'Engine Failure Consideration', page: 36, keywords: ['发动机失效', 'Engine Failure', '关键发动机', 'Critical Engine', 'CS 25', 'FAR 25', '四发飞机', '双发飞机'], regulations: ['CS 25', 'FAR 25'], summary: '性能确定必须考虑地面加速阶段发动机失效的可能性。关键发动机是指其失效对飞机性能或操纵品质影响最不利的发动机。四发飞机的关键发动机是外侧发动机，空客双发飞机不存在关键发动机。' },
  { id: 'C2', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '2', title_zh: '地面限制', title_en: 'Ground limitations', page: 37, keywords: ['地面限制', 'Ground limitations', 'TORA', 'TODA', 'ASDA', 'Stopway', 'Clearway', '跑道长度'] },
  { id: 'C2_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '2.1', title_zh: '起飞长度', title_en: 'Takeoff Lengths', page: 37, keywords: ['TORA', 'TODA', 'ASDA', 'Stopway', 'Clearway', '跑道长度'], summary: '定义了起飞相关的跑道、停止道和净空道的概念。' },
  { id: 'C2_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '2.2', title_zh: '公布的起飞距离', title_en: 'Published Takeoff Distances', page: 38, keywords: ['TORA', 'TODA', 'ASDA'], summary: '解释了TORA（可用起飞滑跑距离）、TODA（可用起飞距离）和ASDA（可用加速停止距离）的定义。' },
  { id: 'C2_3', type: 'topic', section: 'C', sectionTitle: '起飞', code: '2.3', title_zh: '离场扇区', title_en: 'Departure Sector', page: 40, keywords: ['起飞扇区', 'Takeoff Funnel', '障碍物', 'Obstacle Clearance', 'Departure Sector'], summary: '定义了起飞后需要考虑障碍物的区域范围，区分了EASA和FAA的不同规定。' },
  { id: 'C3', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '3', title_zh: '性能限制', title_en: 'Performance limitations', page: 44, keywords: ['性能限制', 'Performance limitations', 'TOD', 'TOR', 'ASD', '起飞航迹'] },
  { id: 'C3_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '3.1', title_zh: '起飞距离', title_en: 'Takeoff Distances', page: 44, keywords: ['TOD', 'TOR', 'ASD', '起飞距离', '起飞滑跑距离', '加速停止距离'], summary: '详细定义了起飞距离（TOD）、起飞滑跑距离（TOR）和加速停止距离（ASD）的计算方法。' },
  { id: 'C3_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '3.2', title_zh: '起飞航迹', title_en: 'Takeoff Trajectory', page: 51, keywords: ['起飞航迹', 'Takeoff Flight Path', 'OEI', 'AEO', '爬升梯度', '障碍物越障', '起飞扇区'], summary: '描述了单发失效（OEI）和全发（AEO）情况下的起飞航迹分段、爬升梯度要求及越障规定。' },
  { id: 'C4', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '4', title_zh: '影响因素', title_en: 'Factors of influence', page: 67, keywords: ['影响因素', 'Factors', 'influence', '温度', '风', '坡度', '跑道状况'] },
  { id: 'C4_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '4.1', title_zh: '外部参数', title_en: 'External Parameters', page: 67, keywords: ['温度', '气压', '跑道状况', '坡度', '风', 'Temperature', 'Pressure', 'Slope', 'Wind'], summary: '分析了温度、气压高度、跑道状况、坡度、风等外部条件对起飞性能的影响。' },
  { id: 'C4_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '4.2', title_zh: '可选参数', title_en: 'Selected Parameters', page: 72, keywords: ['襟翼设置', 'Flap Setting', 'V1', 'V2'], summary: '分析了襟翼设置、决断速度V1和起飞安全速度V2的选择对起飞性能的影响。' },
  { id: 'C5', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '5', title_zh: '最大性能起飞重量', title_en: 'Maximum Performance Takeoff Weight', page: 74, keywords: ['最大性能起飞重量', 'Maximum', 'Performance', 'Takeoff', 'Weight', 'MTOW', '优化'] },
  { id: 'C5_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '5.1', title_zh: '起飞速度优化', title_en: 'Takeoff Speed Optimization', page: 74, keywords: ['速度优化', 'Speed Optimization', 'V1/VR', 'V2/VS'], summary: '解释了如何通过优化V1/VR和V2/VS速度比来获得最大的起飞重量。' },
  { id: 'C5_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '5.2', title_zh: '优化过程结果', title_en: 'Result of the Optimization Process', page: 83, keywords: ['MTOW', '优化', 'Optimization'], summary: '展示了速度优化如何确定唯一的最大起飞重量（MTOW）及其对应的限制因素。' },
  { id: 'C6', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '6', title_zh: '在湿或污染跑道上起飞', title_en: 'Takeoff on Wet or Contaminated Runways', page: 87, keywords: ['湿跑道', '污染跑道', 'Wet', 'Contaminated', 'Runways', '起飞', '水滑'] },
  { id: 'C6_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '6.1', title_zh: '污染物定义', title_en: 'Definitions of Contaminant', page: 87, keywords: ['污染', 'Contaminant', '水', '雪', '冰', 'Water', 'Snow', 'Ice'], summary: '定义了霜、积水、雪泥、湿雪、干雪、压实雪和冰等跑道污染物的类型。' },
  { id: 'C6_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '6.2', title_zh: '跑道状况', title_en: 'Runway Condition', page: 89, keywords: ['跑道状况', 'Runway Condition', '湿', '污染', '干', 'Wet', 'Contaminated', 'Dry'], summary: '定义了干、湿、污染跑道的标准，并介绍了SNOWTAM报告。' },
  { id: 'C6_3', type: 'topic', section: 'C', sectionTitle: '起飞', code: '6.3', title_zh: '污染物分类和特性', title_en: 'Contaminants Classification and Properties', page: 91, keywords: ['污染物', 'Contaminants', '阻力', '摩擦', 'Drag', 'Friction'], summary: '将污染物分为产生阻力和降低摩擦两类，并列出了不同污染物的影响特性。' },
  { id: 'C6_4', type: 'topic', section: 'C', sectionTitle: '起飞', code: '6.4', title_zh: '对性能的影响', title_en: 'Effect on Performance', page: 93, keywords: ['性能影响', 'Performance Effect', '水滑', 'Aquaplaning', '刹车摩擦', '污染物阻力'], summary: '分析了污染物如何通过水滑、置换阻力、喷溅阻力和降低刹车摩擦系数来影响起飞性能。' },
  { id: 'C7', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '7', title_zh: '减推力起飞', title_en: 'Reduced Takeoff Thrust', page: 100, keywords: ['减推力', 'Reduced', 'Thrust', 'Flex', 'Derate', '灵活温度', '假定温度'] },
  { id: 'C7_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '7.1', title_zh: '减推力原理', title_en: 'Principle of Thrust Reduction', page: 100, keywords: ['减推力', 'Thrust Reduction'], summary: '当实际起飞重量小于最大允许起飞重量时，可以通过减推力来延长发动机寿命并降低成本。' },
  { id: 'C7_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '7.2', title_zh: '灵活起飞', title_en: 'Flexible Takeoff', page: 100, keywords: ['灵活温度', 'Flexible Temperature', 'Flex Takeoff', '假定温度'], summary: '灵活起飞（假定温度法）是一种减推力方法，通过输入一个高于实际温度的假定温度来让FADEC降低推力。' },
  { id: 'C7_3', type: 'topic', section: 'C', sectionTitle: '起飞', code: '7.3', title_zh: '减额定推力起飞', title_en: 'Derated Takeoff', page: 103, keywords: ['减额定推力', 'Derated Takeoff', 'Derate'], summary: '减额定推力是一种固定的推力减小等级，它会改变飞机的VMCG和VMCA，可能在短跑道上带来性能优势。' },
  { id: 'C8', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '8', title_zh: '发动机失效程序的具体指导', title_en: 'Specific Guidance for Engine Failure Procedure', page: 105, keywords: ['发动机失效', 'Engine Failure', 'EFP', 'EOSID', '单发', 'SID'] },
  { id: 'C8_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '8.1', title_zh: '公布的离场程序', title_en: 'Published Departure Procedure', page: 105, keywords: ['SID', '离场程序', 'Departure Procedure'], summary: '标准仪表离场程序（SID）是为全发正常运行设计的，不能直接用于单发失效情况。' },
  { id: 'C8_2', type: 'topic', section: 'C', sectionTitle: '起飞', code: '8.2', title_zh: '发动机失效程序', title_en: 'Engine Failure Procedure', page: 105, keywords: ['EFP', 'EOSID', 'Engine Failure Procedure'], summary: '运营商必须为每次离场制定发动机失效程序（EFP），以确保在单发失效时能安全越障。' },
  { id: 'C9', type: 'subsection', section: 'C', sectionTitle: '起飞', code: '9', title_zh: '返场着陆', title_en: 'Return To Land', page: 111, keywords: ['返场着陆', 'Return To Land', '超重着陆', 'Overweight Landing', '燃油抛放', 'Fuel Jettisoning'] },
  { id: 'C9_1', type: 'topic', section: 'C', sectionTitle: '起飞', code: '9.1', title_zh: '超重着陆要求', title_en: 'Overweight Landing Requirements', page: 111, keywords: ['返场着陆', 'Return To Land', '超重着陆', 'Overweight Landing', '燃油抛放', 'Fuel Jettisoning'], summary: '在紧急情况下，飞机可能需要在高于最大着陆重量的情况下着陆。审定标准要求飞机在这种情况下仍能安全着陆或复飞。' },
  { id: 'D', type: 'section', section: 'D', sectionTitle: '飞行中性能', code: 'D', title_zh: '飞行中性能', title_en: 'IN FLIGHT PERFORMANCE', page: 114, keywords: ['飞行中性能', 'IN FLIGHT PERFORMANCE', '爬升', '巡航', '下降', 'Climb', 'Cruise', 'Descent'], summary: '本章讨论飞机在正常飞行中的性能，包括爬升、巡航和下降阶段的性能管理与优化。' },
  { id: 'D1', type: 'subsection', section: 'D', sectionTitle: '飞行中性能', code: '1', title_zh: '爬升', title_en: 'Climb', page: 114, keywords: ['爬升', 'Climb', '爬升性能', '爬升速度', 'Climb Speed', '爬升梯度'] },
  { id: 'D1_1', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '1.1', title_zh: '爬升管理', title_en: 'Climb Management', page: 114, keywords: ['爬升', 'Climb', '推力', 'Thrust', '减额定爬升', 'Derated Climb'], summary: '介绍了爬升阶段的推力管理，包括最大爬升推力和减额定爬升推力。' },
  { id: 'D1_2', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '1.2', title_zh: '爬升速度', title_en: 'Climb Speeds', page: 116, keywords: ['爬升速度', 'Climb Speeds', 'ECON', 'Green Dot', '最大梯度', '最大上升率'], summary: '讨论了不同爬升策略对应的速度，如选择速度、最大梯度速度（绿点）、最小成本速度（ECON）和最大上升率速度。' },
  { id: 'D1_3', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '1.3', title_zh: '客舱爬升', title_en: 'Cabin Climb', page: 118, keywords: ['客舱爬升', 'Cabin Climb', '增压', 'Pressurization'], summary: '描述了客舱增压系统如何根据飞行高度自动调节客舱高度，以保证旅客舒适性。' },
  { id: 'D1_4', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '1.4', title_zh: '影响因素', title_en: 'Factors of Influence', page: 118, keywords: ['影响因素', '爬升', '高度', '温度', '重量', '风'], summary: '分析了高度、温度、重量和风对爬升性能（爬升梯度和上升率）的影响。' },
  { id: 'D2', type: 'subsection', section: 'D', sectionTitle: '飞行中性能', code: '2', title_zh: '巡航', title_en: 'Cruise', page: 120, keywords: ['巡航', 'Cruise', '巡航高度', '成本指数', 'Cost Index', 'ECON', '最佳高度'] },
  { id: 'D2_1', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '2.1', title_zh: '燃油消耗定义', title_en: 'Fuel Consumption Definition', page: 120, keywords: ['燃油消耗', 'Fuel Consumption', 'FF', 'SFC', 'SR', '油耗'], summary: '定义了燃油流量（FF）、比油耗（SFC）、单位距离油耗（Cd）和比航程（SR）等关键燃油经济性指标。' },
  { id: 'D2_2', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '2.2', title_zh: '最小燃油消耗巡航', title_en: 'Cruise at Minimum Fuel Consumption', page: 122, keywords: ['最大航程', 'Maximum Range', 'MMR'], summary: '介绍了最大航程马赫数（MMR），在该马赫数下飞行，单位燃油可以飞行最远距离。' },
  { id: 'D2_3', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '2.3', title_zh: '时间限制', title_en: 'Time Constraints', page: 124, keywords: ['远程巡航', 'Long Range Cruise', 'LRC'], summary: '介绍了远程巡航马赫数（LRC），它以牺牲1%的航程为代价，换取更快的巡航速度，从而缩短飞行时间。' },
  { id: 'D2_4', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '2.4', title_zh: '最小成本巡航', title_en: 'Cruise at Minimum Cost', page: 126, keywords: ['成本指数', 'Cost Index', 'CI', 'ECON Mach'], summary: '解释了成本指数（CI）如何平衡时间成本和燃油成本，以计算出总直接运营成本最低的经济马赫数（ECON Mach）。' },
  { id: 'D2_5', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '2.5', title_zh: '高度优化', title_en: 'Altitude Optimization', page: 128, keywords: ['最佳高度', 'Optimum Altitude', '最大高度', 'Maximum Altitude', '阶梯爬升', 'Step Climb', '抖振裕度'], summary: '讨论了如何通过选择最佳巡航高度和采用阶梯爬升来优化燃油效率，并介绍了最大高度和抖振裕度的限制。' },
  { id: 'D3', type: 'subsection', section: 'D', sectionTitle: '飞行中性能', code: '3', title_zh: '下降/等待', title_en: 'Descent/Holding', page: 141, keywords: ['下降', '等待', 'Descent', 'Holding', '下降剖面', '等待航线', 'TOD'] },
  { id: 'D3_1', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '3.1', title_zh: '下降管理', title_en: 'Descent Management', page: 141, keywords: ['下降', 'Descent', '慢车推力', 'Idle Thrust'], summary: '标准下降在慢车推力下进行，自动推力系统会自动调节以满足剖面要求。' },
  { id: 'D3_2', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '3.2', title_zh: '下降速度', title_en: 'Descent Speeds', page: 141, keywords: ['下降速度', 'Descent Speeds', 'ECON', 'Green Dot', '紧急下降'], summary: '讨论了不同下降策略对应的速度，如选择速度、最小梯度速度（绿点）、经济下降速度（ECON）和紧急下降速度（MMO/VMO）。' },
  { id: 'D3_3', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '3.3', title_zh: '垂直剖面管理', title_en: 'Vertical Profile Management', page: 144, keywords: ['下降顶点', 'Top of Descent', 'TOD', '连续下降', 'CDA'], summary: 'FMS会计算下降顶点（TOD）以实现从巡航高度到进近点的连续下降，从而节省燃油。' },
  { id: 'D3_4', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '3.4', title_zh: '等待管理', title_en: 'Holding Management', page: 145, keywords: ['等待', 'Holding', '等待速度', 'Holding Speed'], summary: '等待期间为了最大化留空时间，应使用能最小化燃油流量的速度，通常是绿点速度。' },
  { id: 'D3_5', type: 'topic', section: 'D', sectionTitle: '飞行中性能', code: '3.5', title_zh: '影响因素', title_en: 'Factors of Influence', page: 146, keywords: ['影响因素', '下降', '高度', '温度', '重量', '风'], summary: '分析了高度、温度、重量和风对下降性能（下降梯度和下降率）的影响。' },

  // ==================== 章节 E: 故障飞行性能 ====================
  { id: 'E', type: 'section', section: 'E', sectionTitle: '故障飞行性能', code: 'E', title_zh: '故障飞行性能', title_en: 'IN FLIGHT PERFORMANCE WITH FAILURE', page: 148, keywords: ['故障', '失效', 'Failure', '发动机失效', 'Engine Failure', '释压', 'Pressurization', 'ETOPS'], summary: '本章讨论在发生发动机失效、座舱释压等故障情况下的飞机性能和操作程序。' },
  { id: 'E1', type: 'subsection', section: 'E', sectionTitle: '故障飞行性能', code: '1', title_zh: '发动机失效', title_en: 'Engine Failure', page: 148, keywords: ['发动机失效', 'Engine Failure', '单发', 'OEI', '飘降', 'Drift Down', '航路越障'] },
  { id: 'E1_1', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '1.1', title_zh: '动力损失造成的问题', title_en: 'Problem Created by Loss of Power', page: 148, keywords: ['发动机失效', '动力损失'], summary: '发动机失效后，剩余推力不足以维持巡航高度和速度，必须下降到推力与阻力能够平衡的新高度。' },
  { id: 'E1_2', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '1.2', title_zh: '通用定义', title_en: 'General Definitions', page: 148, keywords: ['飘降', 'Drift Down', '净航迹', '总航迹', 'Net Flight Path', 'Gross Flight Path'], summary: '定义了发动机失效后的总飘降航迹（Gross Drift Down Flight Path）和用于越障计算的净飘降航迹（Net Drift Down Flight Path）。' },
  { id: 'E1_3', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '1.3', title_zh: '航路越障 - 单发失效', title_en: 'En Route Obstacle Clearance - One Engine Inoperative', page: 150, keywords: ['航路越障', '单发失效', 'OEI', 'Obstacle Clearance'], summary: '规定了单发失效后，净航迹必须在航路两侧5海里范围内，以至少1000英尺或2000英尺的高度裕度越过所有障碍。' },
  { id: 'E1_4', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '1.4', title_zh: '航路越障 - 双发失效', title_en: 'Obstacle Clearance - Two Engines Inoperative', page: 154, keywords: ['航路越障', '双发失效', 'two engines inoperative'], summary: '对于四发飞机，在距离备降场超过90分钟的航段，需考虑双发失效情况，净航迹必须以2000英尺裕度越障。' },
  { id: 'E1_5', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '1.5', title_zh: '空客策略', title_en: 'Airbus Policy', page: 156, keywords: ['标准策略', '障碍物/飘降策略', '固定速度策略'], summary: '介绍了空客推荐的三种发动机失效应对策略：标准策略、障碍物/飘降策略（使用绿点速度）和固定速度策略（用于ETOPS）。' },
  { id: 'E2', type: 'subsection', section: 'E', sectionTitle: '故障飞行性能', code: '2', title_zh: '释压失效', title_en: 'Pressurization Failure', page: 157, keywords: ['释压', '增压', 'Pressurization', 'Failure', '紧急下降', 'Emergency Descent', '氧气'] },
  { id: 'E2_1', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '2.1', title_zh: '旅客需氧量', title_en: 'Passenger Oxygen Requirement', page: 157, keywords: ['需氧量', 'Oxygen Requirement'], summary: '规定了在不同客舱高度下，必须为旅客提供的补充氧气量和持续时间。' },
  { id: 'E2_2', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '2.2', title_zh: '氧气系统', title_en: 'Oxygen Systems', page: 158, keywords: ['氧气系统', 'Oxygen Systems', '化学氧', '气态氧'], summary: '介绍了化学氧气系统和气态氧气系统的特点和工作原理。' },
  { id: 'E2_3', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '2.3', title_zh: '飞行剖面', title_en: 'Flight Profile', page: 159, keywords: ['飞行剖面', 'Flight Profile', '紧急下降'], summary: '释压后的飞行剖面受到氧气系统供应时间的限制，飞机必须在氧气耗尽前下降到安全高度。' },
  { id: 'E2_4', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '2.4', title_zh: '最低飞行高度', title_en: 'Minimum Flight Altitudes', page: 161, keywords: ['MOCA', 'MORA', 'MEA', '最低高度'], summary: '解释了释压下降过程中必须遵守的最低越障高度（MOCA、MORA、MEA）规定。' },
  { id: 'E3', type: 'subsection', section: 'E', sectionTitle: '故障飞行性能', code: '3', title_zh: 'ETOPS飞行', title_en: 'ETOPS Flight', page: 161, keywords: ['ETOPS', '双发延程飞行', 'Extended Twin Operations', '60分钟规则'] },
  { id: 'E3_1', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '3.1', title_zh: '双发飞机 - 60分钟规则', title_en: 'Twin Engine Aircraft - 60 Minute Rule', page: 161, keywords: ['ETOPS', '60分钟规则', 'EDTO'], summary: '解释了ETOPS（双发延程运行）的基本概念，即双发飞机在单发失效后60分钟内无法到达合适备降机场的航线运行需要特殊批准。' },
  { id: 'E3_2', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '3.2', title_zh: 'ETOPS速度策略', title_en: 'ETOPS Speed Strategy', page: 162, keywords: ['ETOPS', '速度策略', '固定速度'], summary: 'ETOPS运行中的发动机失效推荐使用固定速度策略，即以签派时预设的速度和高度飞往备降场。' },
  { id: 'E4', type: 'subsection', section: 'E', sectionTitle: '故障飞行性能', code: '4', title_zh: '航路研究指南', title_en: 'Guidance to Route Studies', page: 163, keywords: ['航路研究', 'Route Studies', '地形', '障碍物', 'Obstacle', '关键点'] },
  { id: 'E4_1', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '4.1', title_zh: '越障 - 发动机失效', title_en: 'Obstacle Clearance - Engine Failure', page: 164, keywords: ['航路研究', '发动机失效', '越障', '不返回点'], summary: '指导运营商如何进行航路研究，确定发动机失效情况下的“不返回点”和“继续点”，以确保越障安全。' },
  { id: 'E4_2', type: 'topic', section: 'E', sectionTitle: '故障飞行性能', code: '4.2', title_zh: '越障 - 客舱释压失效', title_en: 'Obstacle Clearance - Cabin Pressurization Failure', page: 166, keywords: ['航路研究', '释压失效', '越障', '不返回点'], summary: '指导运营商如何进行航路研究，确保在客舱释压紧急下降后，飞行剖面能以2000英尺的裕度越过所有障碍物。' },

  // ==================== 章节 F: 着陆 ====================
  { id: 'F', type: 'section', section: 'F', sectionTitle: '着陆', code: 'F', title_zh: '着陆', title_en: 'LANDING', page: 168, keywords: ['着陆', 'LANDING', '着陆距离', 'Landing Distance', '复飞', 'Go-Around', 'LDA', 'RLD', 'ALD'], summary: '本章介绍着陆性能的限制和计算，包括着陆距离和复飞性能要求。' },
  { id: 'F1', type: 'subsection', section: 'F', sectionTitle: '着陆', code: '1', title_zh: '简介', title_en: 'Introduction', page: 168, keywords: ['着陆', '简介', 'Landing', 'Introduction'] },
  { id: 'F1_1', type: 'topic', section: 'F', sectionTitle: '着陆', code: '1.1', title_zh: '着陆要求概述', title_en: 'Landing Requirements Overview', page: 168, keywords: ['着陆要求', 'Landing Requirements', 'CS 25', 'FAR 25', 'Air OPS', 'FAR 121'], regulations: ['CS 25', 'FAR 25', 'Air OPS', 'FAR 121'], summary: '运营商必须基于飞机认证（CS 25/FAR 25）和运行限制（Air OPS和FAR 121）中定义的运行约束检查着陆要求。在正常运行中，着陆距离通常不是限制因素，大多数情况下在最大着陆重量下的着陆距离都是可实现的。这导致签派期间对着陆检查的重要性降低。' },
  { id: 'F1_2', type: 'topic', section: 'F', sectionTitle: '着陆', code: '1.2', title_zh: '性能评估的重要性', title_en: 'Importance of Performance Assessment', page: 168, keywords: ['性能评估', 'Performance Assessment', '非正常状态', 'Inoperative Items', '不利条件', 'Adverse Conditions', '复飞限制', 'Go-Around Constraints'], summary: '然而，在非正常设备状态、不利外部条件或复飞限制的情况下，着陆性能可能会受到显著限制。因此，性能评估对于确保安全运行至关重要。后续章节将描述干跑道、湿跑道和污染跑道的签派和飞行中着陆距离定义。' },
  { id: 'F1_3', type: 'topic', section: 'F', sectionTitle: '着陆', code: '1.3', title_zh: '参考信息', title_en: 'Reference Information', page: 168, keywords: ['污染物定义', 'Contaminant Definition', '槽纹跑道', 'Grooved Runway', 'PFC跑道', 'PFC Runway'], summary: '关于污染物定义，请参考起飞章节中的污染物定义部分。关于在槽纹或PFC（多孔摩擦路面）跑道上的运行，请参考起飞章节中相应的运行说明。' },
  { id: 'F2', type: 'subsection', section: 'F', sectionTitle: '着陆', code: '2', title_zh: '着陆限制', title_en: 'Landing limitations', page: 168, keywords: ['着陆限制', 'Landing limitations', 'LDA', 'RLD', 'ALD', 'LDTA', '跑道长度'] },
  { id: 'F2_1', type: 'topic', section: 'F', sectionTitle: '着陆', code: '2.1', title_zh: '可用着陆距离', title_en: 'Landing Distance Available (LDA)', page: 168, keywords: ['LDA', '可用着陆距离', 'Landing Distance Available'], summary: 'LDA是宣布可用于飞机着陆滑跑的跑道长度。' },
  { id: 'F2_2', type: 'topic', section: 'F', sectionTitle: '着陆', code: '2.2', title_zh: '签派着陆要求', title_en: 'Dispatch Landing Requirements', page: 170, keywords: ['RLD', '所需着陆距离', 'ALD', '实际着陆距离'], summary: '签派时，必须确保目的地和备降场的LDA满足所需着陆距离（RLD）的要求。RLD是在实际着陆距离（ALD）上增加安全裕度得出的。' },
  { id: 'F2_3', type: 'topic', section: 'F', sectionTitle: '着陆', code: '2.3', title_zh: '飞行中要求 - 到达时着陆距离', title_en: 'In-Flight Requirements - Landing Distance at the Time of Arrival (LDTA)', page: 176, keywords: ['LDTA', 'IFLD', '到达时着陆距离', 'RCAM', 'RWYCC'], summary: 'LDTA（或IFLD）是飞行中用于评估实际着陆性能的距离，考虑了实际条件和操作因素，并需增加15%的安全裕度。' },
  { id: 'F2_4', type: 'topic', section: 'F', sectionTitle: '着陆', code: '2.4', title_zh: '影响因素', title_en: 'Factors of Influence', page: 179, keywords: ['影响因素', '着陆', '高度', '温度', '风', '坡度', '跑道状况'], summary: '分析了高度、温度、风、跑道坡度、跑道状况、飞机形态和进近速度对着陆距离的影响。' },
  { id: 'F2_5', type: 'topic', section: 'F', sectionTitle: '着陆', code: '2.5', title_zh: '签派与飞行中检查对比', title_en: 'Dispatch vs. In-Flight - Landing Distances Performance Checks', page: 181, keywords: ['签派', '飞行中', 'Dispatch', 'In-Flight'], summary: '强调了在签派时除了检查RLD，也应预先检查FLD（含裕度的LDTA），以避免在飞行中发现性能不足。' },
  { id: 'F2_6', type: 'topic', section: 'F', sectionTitle: '着陆', code: '2.6', title_zh: '超重着陆要求', title_en: 'Overweight Landing Requirements', page: 181, keywords: ['超重着陆', 'Overweight Landing'], summary: '超重着陆需参考起飞章节中的“返场着陆”部分。' },
  { id: 'F3', type: 'subsection', section: 'F', sectionTitle: '着陆', code: '3', title_zh: '复飞限制', title_en: 'Go-Around limitations', page: 181, keywords: ['复飞', 'Go-Around', '进近爬升', '着陆爬升', '复飞梯度'] },
  { id: 'F3_1', type: 'topic', section: 'F', sectionTitle: '着陆', code: '3.1', title_zh: '审定的复飞梯度', title_en: 'Certified Go-Around Gradients', page: 181, keywords: ['复飞梯度', 'Go-Around Gradient', '进近爬升', '着陆爬升', 'Approach Climb', 'Landing Climb'], summary: '规定了飞机必须满足的最低“进近爬升梯度”（单发失效）和“着陆爬升梯度”（全发）。' },
  { id: 'F3_2', type: 'topic', section: 'F', sectionTitle: '着陆', code: '3.2', title_zh: '运行要求', title_en: 'Operational Requirements', page: 184, keywords: ['公布梯度', 'Missed Approach Gradient', 'PANS-OPS'], summary: '运营商必须验证在单发失效情况下，飞机预期的着陆重量能够满足仪表进近图上公布的最低复飞爬升梯度要求。' },
  { id: 'F3_3', type: 'topic', section: 'F', sectionTitle: '着陆', code: '3.3', title_zh: '影响因素', title_en: 'Factors of Influence', page: 191, keywords: ['影响因素', '复飞', '高度', '温度', '形态', '速度'], summary: '分析了高度、温度、飞机形态和复飞速度对复飞爬升性能的影响。' },

  // ==================== 章节 G: 燃油规划与管理 ====================
  { id: 'G', type: 'section', section: 'G', sectionTitle: '燃油规划与管理', code: 'G', title_zh: '燃油规划与管理', title_en: 'FUEL PLANNING AND MANAGEMENT', page: 193, keywords: ['燃油', 'FUEL', '规划', '管理', 'EASA', 'FAA', '储备燃油', 'Reserve Fuel'], summary: '本章介绍EASA和FAA关于飞行前燃油规划和飞行中燃油管理的规定。' },
  { id: 'G1', type: 'subsection', section: 'G', sectionTitle: '燃油规划与管理', code: '1', title_zh: 'EASA - 燃油/能源规划与管理', title_en: 'EASA - Fuel/ energy planning and management', page: 193, keywords: ['EASA', '燃油规划', '航程燃油', '备降燃油', '最后储备', '额外燃油'] },
  { id: 'G1_1', type: 'topic', section: 'G', sectionTitle: '燃油规划与管理', code: '1.1', title_zh: '燃油规划政策', title_en: 'Policy for Fuel/Energy Planning', page: 194, keywords: ['EASA', '燃油规划', '航程燃油', '备降燃油', '最后储备', '额外燃油', 'RCF'], summary: '详细解释了EASA规则下不同燃油部分的定义和计算要求，包括滑行、航程、备份、备降、最后储备和额外燃油。' },
  { id: 'G1_2', type: 'topic', section: 'G', sectionTitle: '燃油规划与管理', code: '1.2', title_zh: '燃油管理', title_en: 'Fuel Management', page: 207, keywords: ['EASA', '燃油管理', '最低燃油', 'Mayday Fuel'], summary: '规定了飞行中的燃油检查要求，以及宣布“最低燃油”和“Mayday燃油”的条件。' },
  { id: 'G2', type: 'subsection', section: 'G', sectionTitle: '燃油规划与管理', code: '2', title_zh: 'FAA - 燃油/能源规划与管理', title_en: 'FAA - Fuel/Energy Planning and Management', page: 210, keywords: ['FAA', '燃油规划', 'Domestic', 'Flag', 'Supplemental'] },
  { id: 'G2_1', type: 'topic', section: 'G', sectionTitle: '燃油规划与管理', code: '2.1', title_zh: '不同运行类型', title_en: 'Different Types of Operations', page: 210, keywords: ['FAA', 'Domestic', 'Flag', 'Supplemental'], summary: 'FAA根据运行区域将航班分为国内（Domestic）、国际（Flag）和补充（Supplemental）运行，其燃油要求不同。' },
  { id: 'G2_2', type: 'topic', section: 'G', sectionTitle: '燃油规划与管理', code: '2.2', title_zh: '燃油政策', title_en: 'Fuel Policy', page: 210, keywords: ['FAA', '最低燃油', '航程燃油', '备降燃油', '最后储备'], summary: '详细解释了FAA规则下不同运行类型的最低燃油要求。' },
  { id: 'G2_3', type: 'topic', section: 'G', sectionTitle: '燃油规划与管理', code: '2.3', title_zh: '影响燃油量的程序', title_en: 'Procedures with an Impact on Fuel Quantities', page: 217, keywords: ['FAA', '孤立机场', '重新签派', 'Redispatch', 'ETOPS'], summary: '介绍了孤立机场、重新签派和ETOPS等特殊程序对燃油规划的影响。' },
  { id: 'G2_4', type: 'topic', section: 'G', sectionTitle: '燃油规划与管理', code: '2.4', title_zh: '燃油管理', title_en: 'Fuel Management', page: 218, keywords: ['FAA', '燃油管理'], summary: 'FAA要求运营商在操作手册中制定燃油管理程序，确保着陆时有足够的储备燃油。' },

  // ==================== 附录 ====================
  { id: 'APP1', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 1', title_zh: '国际标准大气', title_en: 'International Standard Atmosphere (ISA)', page: 219, keywords: ['ISA', 'Standard Atmosphere', '国际标准大气', '温度', '气压', '密度', 'Temperature', 'Pressure', 'Density'], summary: '国际标准大气（ISA）模型为飞机性能计算和高度表校准提供了一个全球统一的参考基准。' },
  { id: 'APP2', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 2', title_zh: '飞机运行温度', title_en: 'Temperatures for Aircraft Operations', page: 225, keywords: ['温度', 'Temperatures', 'OAT', 'SAT', 'TAT', '总温', '静温'], summary: '介绍飞机运行中涉及的关键温度定义，包括总温（TAT）和静温（SAT/OAT）。' },
  { id: 'APP3', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 3', title_zh: '高度测量', title_en: 'Altimetry', page: 227, keywords: ['高度', 'Altimetry', 'QNH', 'QFE', '飞行高度层', 'Flight Level', '气压高度', '修正海压'], summary: '解释了基于气压的高度测量原理，包括QNH、QFE和标准气压设置，以及温度修正。' },
  { id: 'APP4', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 4', title_zh: '速度', title_en: 'Speeds', page: 239, keywords: ['速度', 'Speeds', 'IAS', 'CAS', 'TAS', 'GS', 'Mach', '马赫数'], summary: '定义了飞行中使用的不同速度概念，如指示空速(IAS)、校正空速(CAS)、真空速(TAS)和地速(GS)。' },
  { id: 'APP5', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 5', title_zh: '飞行力学', title_en: 'Flight Mechanics', page: 243, keywords: ['飞行力学', 'Flight Mechanics', '升力', '阻力', '推力', '重力', 'Lift', 'Drag', 'Thrust', 'Weight'], summary: '简要回顾了作用在飞机上的四个基本力（升力、阻力、推力和重力）及其在不同飞行阶段的平衡关系。' },
  { id: 'APP6', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 6', title_zh: '航空资料汇编', title_en: 'Aeronautical Information Publication', page: 252, keywords: ['AIP', '航空资料汇编', 'SID', 'STAR', '航图'], summary: '介绍了航空资料汇编（AIP）作为获取机场、航路和障碍物等官方数据的主要来源。' },
  { id: 'APP7', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 7', title_zh: 'SNOWTAM运行使用', title_en: 'Use of SNOWTAM in operations', page: 253, keywords: ['SNOWTAM', '雪情通告', '跑道状况', 'RWYCC', 'Runway Condition'], summary: '解释了如何解读和使用雪情通告（SNOWTAM）来评估受污染跑道对起降性能的影响。' },
  { id: 'APP8', type: 'appendix', section: 'APPENDIX', sectionTitle: '附录', code: 'APPENDIX 8', title_zh: '缩写与符号', title_en: 'Abbreviations and Symbols', page: 257, keywords: ['缩写', '符号', 'Abbreviations', 'Symbols', '术语'], summary: '提供了文档中使用的专业缩写、符号及其全称和解释列表。' }
];

// ==================== 导出索引 ====================
module.exports = performanceIndex;