/**
 * 胜任力数据文件
 * 文件：competence-data.js
 * 说明：此文件由AI根据《AC-121-FS-138R1循证训练（EBT）实施方法-附件D》及《给其他AI的数据转换指导.md》生成。
 *      包含了完整的9个核心胜任力和4个检查员/教员胜任力。
 *
 * 🚨 数据源信息：
 * - 数据源文件：AC-121-FS-138R1循证训练（EBT）实施方法-附件D
 * - 核心胜任力：D-1节，共9项，73个行为指标
 * - 教员胜任力：D-2节，共4项，41个行为指标
 * - 总计：13项胜任力，114个行为指标
 */

// 核心胜任力 (9项)
var coreCompetencies = [
  {
    id: 'KNO',
    category: 'core',
    chinese_name: '知识应用',
    english_name: 'Application of Knowledge',
    description: '展示对相关信息、运行规定、飞机系统和运行环境的知识和理解。',
    description_en: 'Demonstrates knowledge and understanding of relevant information, operating instructions, aircraft systems and the operating environment.',
    behaviors: [
      {
        id: 'OB_KNO_1',
        code: 'OB KNO.1',
        chinese: '展示有关限制和系统及相互作用的实用和适用知识',
        english: 'Demonstrates practical and applicable knowledge of limitations and systems and their interaction'
      },
      {
        id: 'OB_KNO_2',
        code: 'OB KNO.2',
        chinese: '展示所需的已公布的运行规定的知识',
        english: 'Demonstrates required knowledge of published operating instructions'
      },
      {
        id: 'OB_KNO_3',
        code: 'OB KNO.3',
        chinese: '展示有关物理学环境（包括湿度、温度、减噪）、空中交通环境（包括航线、天气、机场和运行基础设施）的知识',
        english: 'Demonstrates knowledge of the physical environment, the air traffic environment including routings, weather, airports and the operational infrastructure'
      },
      {
        id: 'OB_KNO_4',
        code: 'OB KNO.4',
        chinese: '展示有关适用法规的适当知识',
        english: 'Demonstrates appropriate knowledge of applicable legislation'
      },
      {
        id: 'OB_KNO_5',
        code: 'OB KNO.5',
        chinese: '知道从哪里获得所需信息',
        english: 'Knows where to source required information'
      },
      {
        id: 'OB_KNO_6',
        code: 'OB KNO.6',
        chinese: '表现出对获取知识的积极兴趣',
        english: 'Demonstrates a positive interest in acquiring knowledge'
      },
      {
        id: 'OB_KNO_7',
        code: 'OB KNO.7',
        chinese: '能够有效地运用知识',
        english: 'Is able to apply knowledge effectively'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 7
  },
  {
    id: 'PRO',
    category: 'core',
    chinese_name: '程序应用和遵守规章',
    english_name: 'Application of procedures and compliance with regulations',
    description: '根据已发布的运行规定和适用法规，确定并采用适当的程序。',
    description_en: 'Identifies and applies appropriate procedures in accordance with published operating instructions and applicable regulations.',
    behaviors: [
      {
        id: 'OB_PRO_1',
        code: 'OB PRO.1',
        chinese: '确定在哪里可以找到程序和法规',
        english: 'Identifies where to find procedures and regulations'
      },
      {
        id: 'OB_PRO_2',
        code: 'OB PRO.2',
        chinese: '及时应用相关的运行规定、程序和技术',
        english: 'Applies relevant operating instructions, procedures and techniques in a timely manner'
      },
      {
        id: 'OB_PRO_3',
        code: 'OB PRO.3',
        chinese: '遵循 SOP，除非更高的安全性指示需要适当偏离',
        english: 'Follows SOPs unless a higher degree of safety dictates an appropriate deviation'
      },
      {
        id: 'OB_PRO_4',
        code: 'OB PRO.4',
        chinese: '正确操作飞机系统和相关设备',
        english: 'Operates aircraft systems and associated equipment correctly'
      },
      {
        id: 'OB_PRO_5',
        code: 'OB PRO.5',
        chinese: '监控飞机系统状态',
        english: 'Monitors aircraft systems status'
      },
      {
        id: 'OB_PRO_6',
        code: 'OB PRO.6',
        chinese: '遵守适用法规',
        english: 'Complies with applicable regulations'
      },
      {
        id: 'OB_PRO_7',
        code: 'OB PRO.7',
        chinese: '应用相关的程序知识',
        english: 'Applies relevant procedural knowledge'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 7
  },
  {
    id: 'FPA',
    category: 'core',
    chinese_name: '自动航径管理',
    english_name: 'Aircraft Flight Path Management, automation',
    description: '通过自动化控制飞行航径。',
    description_en: 'Controls the flight path through automation.',
    behaviors: [
      {
        id: 'OB_FPA_1',
        code: 'OB FPA.1',
        chinese: '根据已有的飞行管理系统、引导系统，恰当的使用以匹配当时的情况',
        english: 'Uses appropriate flight management, guidance systems and automation, as installed and applicable to the conditions'
      },
      {
        id: 'OB_FPA_2',
        code: 'OB FPA.2',
        chinese: '监控并识别与预计飞行航径的偏差，并采取适当措施',
        english: 'Monitors and detects deviations from the intended flight path and takes appropriate action'
      },
      {
        id: 'OB_FPA_3',
        code: 'OB FPA.3',
        chinese: '管理飞行航径以实现最佳运行表现',
        english: 'Manages the flight path safely to achieve optimum operational performance'
      },
      {
        id: 'OB_FPA_4',
        code: 'OB FPA.4',
        chinese: '使用自动化功能保持预计飞行航径，同时管理其他任务和干扰',
        english: 'Maintains the intended flight path during flight using automation while managing other tasks and distractions'
      },
      {
        id: 'OB_FPA_5',
        code: 'OB FPA.5',
        chinese: '根据飞行阶段和工作负荷，及时选择适当的自动化级别和模式',
        english: 'Selects appropriate level and mode of automation in a timely manner considering phase of flight and workload'
      },
      {
        id: 'OB_FPA_6',
        code: 'OB FPA.6',
        chinese: '有效监控飞行引导系统，包括接通的状态和自动模式的转换',
        english: 'Effectively monitors automation, including engagement and automatic mode transitions'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 6
  },
  {
    id: 'FPM',
    category: 'core',
    chinese_name: '人工航径管理',
    english_name: 'Aircraft Flight Path Management, manual control',
    description: '通过人工控制飞行航径。',
    description_en: 'Controls the flight path through manual control.',
    behaviors: [
      {
        id: 'OB_FPM_1',
        code: 'OB FPM.1',
        chinese: '根据情况，以适宜的方式，准确、平稳地人工控制飞机',
        english: 'Controls the aircraft manually with accuracy and smoothness as appropriate to the situation'
      },
      {
        id: 'OB_FPM_2',
        code: 'OB FPM.2',
        chinese: '监控并识别与预计飞行航径的偏差，并采取适当措施',
        english: 'Monitors and detects deviations from the intended flight path and takes appropriate action'
      },
      {
        id: 'OB_FPM_3',
        code: 'OB FPM.3',
        chinese: '使用飞机姿态、速度和推力之间的关系，以及导航信号或目视信息来人工控制飞机',
        english: 'Manually controls the aircraft using the relationship between aircraft attitude, speed and thrust, and navigation signals or visual information'
      },
      {
        id: 'OB_FPM_4',
        code: 'OB FPM.4',
        chinese: '管理飞行航径以实现最佳运行表现',
        english: 'Manages the flight path safely to achieve optimum operational performance'
      },
      {
        id: 'OB_FPM_5',
        code: 'OB FPM.5',
        chinese: '在人工飞行期间保持预计飞行航径，同时管理其他任务和干扰',
        english: 'Maintains the intended flight path during manual flight while managing other tasks and distractions'
      },
      {
        id: 'OB_FPM_6',
        code: 'OB FPM.6',
        chinese: '根据已有的飞行管理系统、引导系统，恰当的使用以匹配当时的情况',
        english: 'Uses appropriate flight management and guidance systems, as installed and applicable to the conditions'
      },
      {
        id: 'OB_FPM_7',
        code: 'OB FPM.7',
        chinese: '有效监控飞行引导系统，包括接通的状态和自动模式的转换',
        english: 'Effectively monitors flight guidance systems including engagement and automatic mode transitions'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 7
  },
  {
    id: 'COM',
    category: 'core',
    chinese_name: '沟通',
    english_name: 'Communication',
    description: '在正常和非正常情况下，通过适当的方式在操作环境中进行沟通。',
    description_en: 'Communicates through appropriate means in the operational environment, in both normal and non-normal situations.',
    behaviors: [
      {
        id: 'OB_COM_1',
        code: 'OB COM.1',
        chinese: '确定接收者已准备好并且能够接收信息',
        english: 'Determines that the recipient is ready and able to receive information'
      },
      {
        id: 'OB_COM_2',
        code: 'OB COM.2',
        chinese: '恰当选择沟通的内容、时机、方式和对象',
        english: 'Selects appropriately what, when, how and with whom to communicate'
      },
      {
        id: 'OB_COM_3',
        code: 'OB COM.3',
        chinese: '清晰、准确、简洁地传递信息',
        english: 'Conveys messages clearly, accurately and concisely'
      },
      {
        id: 'OB_COM_4',
        code: 'OB COM.4',
        chinese: '确认接收者展示出对重要信息的理解',
        english: 'Confirms that the recipient demonstrates the understanding of important information'
      },
      {
        id: 'OB_COM_5',
        code: 'OB COM.5',
        chinese: '接收信息时，积极倾听并展示理解',
        english: 'Listens actively and demonstrates understanding when receiving information'
      },
      {
        id: 'OB_COM_6',
        code: 'OB COM.6',
        chinese: '询问相关且有效的问题',
        english: 'Asks relevant and effective questions'
      },
      {
        id: 'OB_COM_7',
        code: 'OB COM.7',
        chinese: '适当升级沟通以解决已发现的偏差',
        english: 'Uses appropriate escalation in communication to resolve identified deviations'
      },
      {
        id: 'OB_COM_8',
        code: 'OB COM.8',
        chinese: '以适合组织和社会文化的方式使用和解读非语言沟通',
        english: 'Uses and interprets non-verbal communication in a manner appropriate to the organizational and social culture'
      },
      {
        id: 'OB_COM_9',
        code: 'OB COM.9',
        chinese: '遵守标准的无线电通话用语和程序',
        english: 'Adheres to standard radiotelephone phraseology and procedures'
      },
      {
        id: 'OB_COM_10',
        code: 'OB COM.10',
        chinese: '使用英文准确阅读、理解、构建和回应数据链信息',
        english: 'Accurately reads, interprets, constructs and responds to datalink messages in English'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 10
  },
  {
    id: 'LTW',
    category: 'core',
    chinese_name: '领导力与团队合作',
    english_name: 'Leadership and Teamwork',
    description: '影响他人以实现共同的目标。合作完成团队的目标。',
    description_en: 'Influences others to contribute to a shared purpose. Collaborates to accomplish the goals of the team.',
    behaviors: [
      {
        id: 'OB_LTW_1',
        code: 'OB LTW.1',
        chinese: '鼓励团队参与和开放坦诚交流',
        english: 'Encourages team participation and open communication'
      },
      {
        id: 'OB_LTW_2',
        code: 'OB LTW.2',
        chinese: '需要时表现出主观能动性和提供指导',
        english: 'Demonstrates initiative and provides direction when required'
      },
      {
        id: 'OB_LTW_3',
        code: 'OB LTW.3',
        chinese: '使他人参与计划',
        english: 'Engages others in planning'
      },
      {
        id: 'OB_LTW_4',
        code: 'OB LTW.4',
        chinese: '考虑他人的意见',
        english: 'Considers inputs from others'
      },
      {
        id: 'OB_LTW_5',
        code: 'OB LTW.5',
        chinese: '适宜地给予和接受反馈意见',
        english: 'Gives and receives feedback constructively'
      },
      {
        id: 'OB_LTW_6',
        code: 'OB LTW.6',
        chinese: '以有效的方式处理和解决冲突与分歧',
        english: 'Addresses and resolves conflicts and disagreements in a constructive manner'
      },
      {
        id: 'OB_LTW_7',
        code: 'OB LTW.7',
        chinese: '在需要时果断地领导',
        english: 'Exercises decisive leadership when required'
      },
      {
        id: 'OB_LTW_8',
        code: 'OB LTW.8',
        chinese: '承担决策和行动的责任',
        english: 'Accepts responsibility for decisions and actions'
      },
      {
        id: 'OB_LTW_9',
        code: 'OB LTW.9',
        chinese: '遵照执行指令',
        english: 'Carries out instructions when directed'
      },
      {
        id: 'OB_LTW_10',
        code: 'OB LTW.10',
        chinese: '应用有效的干预策略来解决已发现的偏差',
        english: 'Applies effective intervention strategies to resolve identified deviations'
      },
      {
        id: 'OB_LTW_11',
        code: 'OB LTW.11',
        chinese: '管理文化和语言方面的挑战（如适用）',
        english: 'Manages cultural and language challenges, as applicable'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 11
  },
  {
    id: 'SAW',
    category: 'core',
    chinese_name: '情景意识与信息管理',
    english_name: 'Situation awareness and management of information',
    description: '感知、理解和管理信息，并预判其对运行的影响。',
    description_en: 'Perceives, comprehends and manages information and anticipates its effect on the operation.',
    behaviors: [
      {
        id: 'OB_SAW_1',
        code: 'OB SAW.1',
        chinese: '监控并评估飞机及系统的状态',
        english: 'Monitors and assesses the state of the aircraft and its systems'
      },
      {
        id: 'OB_SAW_2',
        code: 'OB SAW.2',
        chinese: '监控并评估飞机的能量状态及预计的飞行航径',
        english: 'Monitors and assesses the aircraft\'s energy state, and its anticipated flight path.'
      },
      {
        id: 'OB_SAW_3',
        code: 'OB SAW.3',
        chinese: '监控和评估可能影响运行的整体环境',
        english: 'Monitors and assesses the general environment as it may affect the operation'
      },
      {
        id: 'OB_SAW_4',
        code: 'OB SAW.4',
        chinese: '验证信息的准确性并检查过失误差',
        english: 'Validates the accuracy of information and checks for gross errors'
      },
      {
        id: 'OB_SAW_5',
        code: 'OB SAW.5',
        chinese: '保持对参与操作或受运行影响的人员以及他们按预期表现的能力的意识',
        english: 'Maintains awareness of the people involved in or affected by the operation and their capacity to perform as expected'
      },
      {
        id: 'OB_SAW_6',
        code: 'OB SAW.6',
        chinese: '根据与威胁和差错相关的潜在风险，制定有效的应对预案',
        english: 'Develops effective contingency plans based upon potential risks associated with threats and errors'
      },
      {
        id: 'OB_SAW_7',
        code: 'OB SAW.7',
        chinese: '对情景意识下降的迹象做出回应',
        english: 'Responds to indications of reduced situation awareness'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 7
  },
  {
    id: 'WLM',
    category: 'core',
    chinese_name: '工作负荷管理',
    english_name: 'Workload Management',
    description: '使用合适资源，适当的制定优先级并分配任务，以保持可用的工作负荷余度。',
    description_en: 'Maintain available workload capacity by prioritizing and distributing tasks using appropriate resources.',
    behaviors: [
      {
        id: 'OB_WLM_1',
        code: 'OB WLM.1',
        chinese: '在各种情况下都有良好的自我管理（情绪、行为）',
        english: 'Exercises self-control in all situations'
      },
      {
        id: 'OB_WLM_2',
        code: 'OB WLM.2',
        chinese: '对任务进行有效的规划、优先级分配及时间节点安排',
        english: 'Plans, prioritizes and schedules appropriate tasks effectively'
      },
      {
        id: 'OB_WLM_3',
        code: 'OB WLM.3',
        chinese: '在执行任务时有效地管理时间',
        english: 'Manages time efficiently when carrying out tasks'
      },
      {
        id: 'OB_WLM_4',
        code: 'OB WLM.4',
        chinese: '提供和给予协助',
        english: 'Offers and gives assistance'
      },
      {
        id: 'OB_WLM_5',
        code: 'OB WLM.5',
        chinese: '委派任务',
        english: 'Delegates tasks'
      },
      {
        id: 'OB_WLM_6',
        code: 'OB WLM.6',
        chinese: '适当时寻求并接受协助',
        english: 'Seeks and accepts assistance, when appropriate'
      },
      {
        id: 'OB_WLM_7',
        code: 'OB WLM.7',
        chinese: '认真对动作进行监控、回顾、交叉检查',
        english: 'Monitors, reviews and cross-checks actions conscientiously'
      },
      {
        id: 'OB_WLM_8',
        code: 'OB WLM.8',
        chinese: '核实任务是否已达到预期结果',
        english: 'Verifies that tasks are completed to the expected outcome'
      },
      {
        id: 'OB_WLM_9',
        code: 'OB WLM.9',
        chinese: '在执行任务中出现（干扰、分心、变化及故障）的情形时，进行有效的管理并恢复正常状态',
        english: 'Manages and recovers from interruptions, distractions, variations and failures effectively while performing tasks'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 9
  },
  {
    id: 'PSD',
    category: 'core',
    chinese_name: '问题解决与决策',
    english_name: 'Problem Solving and Decision Making',
    description: '识别征兆、减轻问题；并做出决策。',
    description_en: 'Identifies precursors, mitigates problems; and makes decisions.',
    behaviors: [
      {
        id: 'OB_PSD_1',
        code: 'OB PSD.1',
        chinese: '及时识别、评估和管理威胁和差错',
        english: 'Identifies, assesses and manages threats and errors in a timely manner'
      },
      {
        id: 'OB_PSD_2',
        code: 'OB PSD.2',
        chinese: '从适当的来源寻求准确和充分的信息',
        english: 'Seeks accurate and adequate information from appropriate sources'
      },
      {
        id: 'OB_PSD_3',
        code: 'OB PSD.3',
        chinese: '识别并核实出现的问题及原因（如适用）',
        english: 'Identifies and verifies what and why things have gone wrong, if appropriate'
      },
      {
        id: 'OB_PSD_4',
        code: 'OB PSD.4',
        chinese: '在保证安全的前提下，坚持不懈地解决问题',
        english: 'Perseveres in working through problems while prioritizing safety'
      },
      {
        id: 'OB_PSD_5',
        code: 'OB PSD.5',
        chinese: '确定并考虑适当的选项',
        english: 'Identifies and considers appropriate options'
      },
      {
        id: 'OB_PSD_6',
        code: 'OB PSD.6',
        chinese: '应用适当和及时的决策技巧（适时的使用理性决策和直觉决策）',
        english: 'Applies appropriate and timely decision-making techniques'
      },
      {
        id: 'OB_PSD_7',
        code: 'OB PSD.7',
        chinese: '根据需要监控、回顾以及调整决策',
        english: 'Monitors, reviews and adapts decisions as required'
      },
      {
        id: 'OB_PSD_8',
        code: 'OB PSD.8',
        chinese: '在缺乏指导或程序的情况下随机应变',
        english: 'Adapts when faced with situations where no guidance or procedure exists'
      },
      {
        id: 'OB_PSD_9',
        code: 'OB PSD.9',
        chinese: '遇到意外事件时展现出复原力',
        english: 'Demonstrates resilience when encountering an unexpected event'
      }
    ],
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-1',
    behavior_count: 9
  }
];

// 检查员和教员胜任力 (4项)
var instructorCompetencies = [
  {
    id: 'MGMT',
    category: 'instructor',
    chinese_name: '管理学习环境',
    english_name: 'Management of the learning environment',
    description: '确保教学、评估环境合适并且安全。',
    description_en: 'Ensures that the instruction, assessment and evaluation are conducted in a suitable and safe environment.',
    behaviors: [
      {
        id: 'OB_MGMT_1',
        code: 'OB MGMT.1',
        chinese: '在教学和评估中实施威胁和差错管理 (TEM)',
        english: 'Applies TEM in the context of instruction/evaluation'
      },
      {
        id: 'OB_MGMT_2',
        code: 'OB MGMT.2',
        chinese: '针对教学/评估期间可能发生的情况，讲评相应的安全程序',
        english: 'Briefs on safety procedures for situations that are likely to develop during instruction/evaluation'
      },
      {
        id: 'OB_MGMT_3',
        code: 'OB MGMT.3',
        chinese: '在正确的时间，以正确的水平适当干预（例如逐步从语言提示到接管操纵）',
        english: 'Intervenes appropriately, at the correct time and level (e.g., progressively from verbal assistance to taking over control).'
      },
      {
        id: 'OB_MGMT_4',
        code: 'OB MGMT.4',
        chinese: '根据实际情况，在任何干预后恢复教学或评估',
        english: 'Resumes instruction/evaluation as practicable after any intervention.'
      },
      {
        id: 'OB_MGMT_5',
        code: 'OB MGMT.5',
        chinese: '计划和准备训练媒体、训练设备和资源',
        english: 'Plans and prepares training media, equipment and resources.'
      },
      {
        id: 'OB_MGMT_6',
        code: 'OB MGMT.6',
        chinese: '对影响训练的设备或飞机限制值进行讲评（根据实际情况）',
        english: 'Briefs on training devices or aircraft limitations that may influence training, when applicable.'
      },
      {
        id: 'OB_MGMT_7',
        code: 'OB MGMT.7',
        chinese: '创设和管理适于训练目标的情况/条件（例如空域，ATC，天气，时间等）',
        english: 'Creates and manages conditions (e.g., airspace, ATC, weather, time, etc.) to be suitable for the training objectives.'
      },
      {
        id: 'OB_MGMT_8',
        code: 'OB MGMT.8',
        chinese: '适应环境中的变化，最大程度减少训练中断',
        english: 'Adapts to changes in the environment whilst minimizing training disruptions.'
      },
      {
        id: 'OB_MGMT_9',
        code: 'OB MGMT.9',
        chinese: '管理时间、训练媒体和设备来确保满足训练目标',
        english: 'Manages time, training media and equipment to ensure that training objectives are met.'
      }
    ],
    conditions: {
      ground_training: '地面训练（包括 CRM）',
      flight_training: '飞行训练：在飞机和FSTD中涉及训练内容：-执照 -型别等级 -转机型 -航线 -复训'
    },
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-2',
    behavior_count: 9
  },
  {
    id: 'INST',
    category: 'instructor',
    chinese_name: '教学',
    english_name: 'Instruction',
    description: '为发展学员的胜任力而实施训练。',
    description_en: 'Conducts training to develop the trainee\'s competencies.',
    behaviors: [
      {
        id: 'OB_INST_1',
        code: 'OB INST.1',
        chinese: '参考批准的资料（运行/技术/训练手册，标准和法规）',
        english: 'References approved sources (operations, technical, and training manuals, standards and regulations).'
      },
      {
        id: 'OB_INST_2',
        code: 'OB INST.2',
        chinese: '明确训练目标和训练的角色',
        english: 'States clearly the objectives and clarifies roles for the training.'
      },
      {
        id: 'OB_INST_3',
        code: 'OB INST.3',
        chinese: '遵守经批准的训练项目',
        english: 'Follows the approved training program.'
      },
      {
        id: 'OB_INST_4',
        code: 'OB INST.4',
        chinese: '运用适当的教学法（例如讲解，示范，探索型学习，引导式教学，上座教学）',
        english: 'Applies instructional methods as appropriate (e.g., explanation, demonstration, learning by discovery, facilitation, in-seat instruction).'
      },
      {
        id: 'OB_INST_5',
        code: 'OB INST.5',
        chinese: '保持与运行的相关度及真实性',
        english: 'Sustains operational relevance and realism.'
      },
      {
        id: 'OB_INST_6',
        code: 'OB INST.6',
        chinese: '适应教员指导的总量，确保能实现训练目标',
        english: 'Adapts the amount of instructor inputs to ensure that the training objectives are met.'
      },
      {
        id: 'OB_INST_7',
        code: 'OB INST.7',
        chinese: '适应可能打乱时间顺序的情况',
        english: 'Adapts to situations that might disrupt a planned sequence of events.'
      },
      {
        id: 'OB_INST_8',
        code: 'OB INST.8',
        chinese: '持续评估学员的胜任力',
        english: 'Continuously assesses trainee\'s competencies.'
      },
      {
        id: 'OB_INST_9',
        code: 'OB INST.9',
        chinese: '鼓励学员自我评估',
        english: 'Encourages the trainee to self-assess.'
      },
      {
        id: 'OB_INST_10',
        code: 'OB INST.10',
        chinese: '允许学员及时地自行纠错',
        english: 'Allows trainee to self-correct in a timely manner.'
      },
      {
        id: 'OB_INST_11',
        code: 'OB INST.11',
        chinese: '应用以学员为中心的反馈技巧（例如引导法等）',
        english: 'Applies trainee-centered feedback techniques (e.g., facilitation, etc.).'
      },
      {
        id: 'OB_INST_12',
        code: 'OB INST.12',
        chinese: '进行正面强化',
        english: 'Provides positive reinforcement.'
      }
    ],
    conditions: {
      ground_training: '地面训练（包括 CRM）',
      flight_training: '飞行训练：在飞机和FSTD中涉及训练内容：-执照 -型别等级 -转机型 -航线 -复训'
    },
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-2',
    behavior_count: 12
  },
  {
    id: 'INTR',
    category: 'instructor',
    chinese_name: '与学员互动',
    english_name: 'Interaction with the trainees',
    description: '支持学员们的学习和发展。展现出榜样和表率行为（模范作用）。',
    description_en: 'Supports the trainees\' learning and development. Demonstrates exemplary behavior (role model).',
    behaviors: [
      {
        id: 'OB_INTR_1',
        code: 'OB INTR.1',
        chinese: '表现出对学员的尊重（例如对于文化，语言，经历）',
        english: 'Shows respect for the trainees (e.g., for culture, language, experience).'
      },
      {
        id: 'OB_INTR_2',
        code: 'OB INTR.2',
        chinese: '展示出耐心和同理心（例如积极倾听，领会非语言的信息，鼓励对话）',
        english: 'Shows patience and empathy (e.g., by actively listening, reading non-verbal messages and encouraging dialogue).'
      },
      {
        id: 'OB_INTR_3',
        code: 'OB INTR.3',
        chinese: '管理学员的学习障碍',
        english: 'Manages trainees\' barriers to learning.'
      },
      {
        id: 'OB_INTR_4',
        code: 'OB INTR.4',
        chinese: '鼓励参与和共同支持',
        english: 'Encourages engagement and mutual support.'
      },
      {
        id: 'OB_INTR_5',
        code: 'OB INTR.5',
        chinese: '指导学员',
        english: 'Coaches the trainees.'
      },
      {
        id: 'OB_INTR_6',
        code: 'OB INTR.6',
        chinese: '支持公司/训练机构和局方的目标和训练政策',
        english: 'Supports the goal and training policies of the Operator/ATO and Authority.'
      },
      {
        id: 'OB_INTR_7',
        code: 'OB INTR.7',
        chinese: '展示出正直的品质（例如诚实和专业原则）',
        english: 'Shows integrity (e.g., honesty and professional principles).'
      },
      {
        id: 'OB_INTR_8',
        code: 'OB INTR.8',
        chinese: '展示出可接受的个人行为、社会行为、专业知识，在专业和社交方面树立榜样',
        english: 'Demonstrates acceptable personal conduct, acceptable social practices, content expertise, a model for professional and interpersonal behavior.'
      },
      {
        id: 'OB_INTR_9',
        code: 'OB INTR.9',
        chinese: '积极寻求和接受反馈，以提高个人能力',
        english: 'Actively seeks and accepts feedback to improve own performance.'
      }
    ],
    conditions: {
      ground_training: '地面训练（包括 CRM）',
      flight_training: '飞行训练：在飞机和FSTD中涉及训练内容：-执照 -型别等级 -转机型 -航线 -复训'
    },
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-2',
    behavior_count: 9
  },
  {
    id: 'ASSMT',
    category: 'instructor',
    chinese_name: '评估',
    english_name: 'Assessment',
    description: '评估学员的胜任力。为训练系统的持续改进作贡献。',
    description_en: 'Assesses the competencies of the trainee. Contributes to continuous training system improvement.',
    behaviors: [
      {
        id: 'OB_ASSMT_1',
        code: 'OB ASSMT.1',
        chinese: '遵守公司/训练机构和局方的要求',
        english: 'Complies with Operator/ATOs and Authority requirements.'
      },
      {
        id: 'OB_ASSMT_2',
        code: 'OB ASSMT.2',
        chinese: '确保学员了解评估过程',
        english: 'Ensures that the trainee understands the assessment process.'
      },
      {
        id: 'OB_ASSMT_3',
        code: 'OB ASSMT.3',
        chinese: '运用胜任力标准和条件',
        english: 'Applies the competency standards and conditions.'
      },
      {
        id: 'OB_ASSMT_4',
        code: 'OB ASSMT.4',
        chinese: '评估学员的胜任力',
        english: 'Assesses trainee\'s competencies.'
      },
      {
        id: 'OB_ASSMT_5',
        code: 'OB ASSMT.5',
        chinese: '执行评分',
        english: 'Performs grading.'
      },
      {
        id: 'OB_ASSMT_6',
        code: 'OB ASSMT.6',
        chinese: '根据评估结果提供建议',
        english: 'Provides recommendations based on the outcome of the assessment.'
      },
      {
        id: 'OB_ASSMT_7',
        code: 'OB ASSMT.7',
        chinese: '根据总结性评估结果做出决策',
        english: 'Makes decisions based on the outcome of the summative assessment.'
      },
      {
        id: 'OB_ASSMT_8',
        code: 'OB ASSMT.8',
        chinese: '向学员提供清晰的反馈',
        english: 'Provides clear feedback to the trainee.'
      },
      {
        id: 'OB_ASSMT_9',
        code: 'OB ASSMT.9',
        chinese: '报告训练系统的优缺点（例如训练环境、课程、评估），包括学员的反馈',
        english: 'Reports strengths and weaknesses of the training system (e.g., training environment, curriculum, assessment/evaluation) including feedback from trainees.'
      },
      {
        id: 'OB_ASSMT_10',
        code: 'OB ASSMT.10',
        chinese: '对训练系统的改进提出建议',
        english: 'Suggests improvements for the training system.'
      },
      {
        id: 'OB_ASSMT_11',
        code: 'OB ASSMT.11',
        chinese: '使用适当的形式和媒介生成报告',
        english: 'Produces reports using appropriate forms and media.'
      }
    ],
    conditions: {
      ground_training: '地面训练（包括 CRM）',
      flight_training: '飞行训练：在飞机和FSTD中涉及训练内容：-执照 -型别等级 -转机型 -航线 -复训'
    },
    source: 'AC-121-FS-138R1循证训练（EBT）实施方法-附件D',
    section: 'D-2',
    behavior_count: 11
  }
];

// 导出合并数组
module.exports = coreCompetencies.concat(instructorCompetencies);