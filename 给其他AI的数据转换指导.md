# 数据转换任务：Markdown表格 → JavaScript数据文件

## 任务概述

将《附件D：PLM胜任力及行为指标框架》Markdown文件中的两个表格转换为JavaScript数据文件。

---

## 输入文件

**文件路径**：`D:\FlightToolbox\图片\附件 D：PLM 胜任力及行为指标框架_MinerU__20251012070325.md`

**内容结构**：
- **D-1表格**：核心胜任力及行为指标框架（9个胜任力，共81个行为指标）
- **D-2表格**：检查员和教员胜任力及行为指标框架（4个胜任力）

---

## 输出文件

**文件路径**：`D:\FlightToolbox\miniprogram\packageCompetence\competence-data.js`

**文件格式**：JavaScript模块（使用 `var` 和单引号）

---

## 数据结构模板

```javascript
/**
 * 胜任力数据文件
 * 文件：competence-data.js
 */

// 核心胜任力数据（9个）
var coreCompetencies = [
  {
    id: 'KNO',                                    // 胜任力代码
    category: 'core',                             // 类别：'core' 或 'instructor'
    chinese_name: '知识应用',                      // 中文名称
    english_name: 'Application of Knowledge',     // 英文名称
    description: '展示对相关信息、运行规定、飞机系统和运行环境的知识和理解。',
    description_en: 'Demonstrates knowledge and understanding of relevant information, operating instructions, aircraft systems and the operating environment.',
    behaviors: [
      {
        id: 'OB_KNO_1',                           // 格式：OB_胜任力代码_序号
        code: 'OB KNO.1',                         // 原始代码
        chinese: '展示有关限制和系统及相互作用的实用和适用知识',
        english: 'Demonstrates practical and applicable knowledge of limitations and systems and their interaction'
      }
      // ... 其他行为指标（KNO共7个）
    ],
    source: '附件D：PLM胜任力及行为指标框架',
    section: 'D-1',
    behavior_count: 7
  }
  // ... 其他8个核心胜任力
];

// 检查员和教员胜任力数据（4个）
var instructorCompetencies = [
  {
    id: 'MGMT',
    category: 'instructor',
    chinese_name: '管理学习环境',
    english_name: 'Management of the learning environment',
    description: '确保教学、评估环境合适并且安全。',
    description_en: 'Ensures that the instruction, assessment and evaluation are conducted in a suitable and safe environment',
    behaviors: [
      {
        id: 'OB_MGMT_1',
        code: 'OB MGMT.1',
        chinese: '在教学和评估中实施威胁和差错管理 (TEM)',
        english: 'Applies TEM in the context of instruction/evaluation'
      }
      // ... 其他行为指标（MGMT共9个）
    ],
    conditions: {                                 // 检查员/教员专用字段
      ground_training: '地面训练（包括 CRM）',
      flight_training: '飞行训练：在飞机和FSTD中涉及训练内容：-执照 -型别等级 -转机型 -航线 -复训'
    },
    source: '附件D：PLM胜任力及行为指标框架',
    section: 'D-2',
    behavior_count: 9
  }
  // ... 其他3个检查员和教员胜任力
];

// 导出合并数组
module.exports = coreCompetencies.concat(instructorCompetencies);
```

---

## 胜任力代码映射

### D-1：核心胜任力（9个）

| 中文名称 | 英文名称 | 代码 | 行为指标数量 |
|---------|---------|------|------------|
| 知识应用 | Application of Knowledge | KNO | 7 |
| 程序应用和遵守规章 | Application of procedures and compliance with regulations | PRO | 7 |
| 自动航径管理 | Aircraft Flight Path Management, automation | FPA | 6 |
| 人工航径管理 | Aircraft Flight Path Management, manual control | FPM | 7 |
| 沟通 | Communication | COM | 10 |
| 领导力与团队合作 | Leadership and Teamwork | LTW | 11 |
| 情景意识与信息管理 | Situation awareness and management of information | SAW | 7 |
| 工作负荷管理 | Workload Management | WLM | 9 |
| 问题解决与决策 | Problem Solving and Decision Making | PSD | 9 |

**合计**：73个行为指标

### D-2：检查员和教员胜任力（4个）

| 中文名称 | 英文名称 | 代码 | 行为指标数量 |
|---------|---------|------|------------|
| 管理学习环境 | Management of the learning environment | MGMT | 9 |
| 教学 | Instruction | INST | 11 |
| 与学员互动 | Interaction with the trainees | INTR | 9 |
| 评估 | Assessment | 11 |

**合计**：40个行为指标

**总计**：13个胜任力，113个行为指标

---

## 转换规则

### 1. 编码规范
- 使用 `var` 声明变量（不使用 let/const）
- 字符串统一使用单引号 `'`
- 使用 `module.exports` 导出

### 2. 字段要求
- 所有字段不能缺失
- 中英文内容必须完整且对应
- 行为指标ID必须唯一（格式：`OB_代码_序号`）

### 3. 数据清洗
- 移除Markdown表格标记（`|`、`<table>`、`<tr>`、`<td>` 等）
- 处理换行符，保持文本连续
- 移除多余空格
- 转义特殊字符（引号、换行等）
- 移除 `rowspan`、`colspan` 等HTML属性

### 4. 特殊处理
- **D-2的conditions字段**：从表格的"条件"列提取，检查员/教员胜任力专用
- **behavior_count字段**：统计该胜任力的行为指标数量
- **行为指标排序**：按照原始表格顺序，保持OB编号连续

---

## 转换示例

### 输入（Markdown表格片段）

```markdown
| 知识应用 Application of Knowledge (KNO) | 展示对相关信息、运行规定、飞机系统和运行环境的知识和理解。 | OB KNO.1 展示有关限制和系统及相互作用的实用和适用知识 |
| | | OB KNO.2 展示所需的已公布的运行规定的知识 |
```

### 输出（JavaScript对象）

```javascript
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
    }
    // ... 其他5个行为指标
  ],
  source: '附件D：PLM胜任力及行为指标框架',
  section: 'D-1',
  behavior_count: 7
}
```

---

## 质量检查清单

转换完成后，请验证：

- [ ] 文件使用 `var` 和单引号 `'`
- [ ] 共13个胜任力对象（9个core + 4个instructor）
- [ ] 共113个行为指标（73 + 40）
- [ ] 每个胜任力对象包含所有必须字段
- [ ] 所有行为指标ID唯一且符合格式（`OB_代码_序号`）
- [ ] 中英文内容完整且对应
- [ ] 特殊字符正确转义
- [ ] 使用 `module.exports` 导出合并数组
- [ ] 文件可在Node.js中正常加载（无语法错误）

---

## 预期输出验证

生成的文件应该能够通过以下测试：

```javascript
// 验证代码
var competenceData = require('./competence-data.js');

console.log('总胜任力数量:', competenceData.length);  // 应为 13
console.log('核心胜任力数量:', competenceData.filter(c => c.category === 'core').length);  // 应为 9
console.log('检查员教员胜任力数量:', competenceData.filter(c => c.category === 'instructor').length);  // 应为 4

var totalBehaviors = 0;
competenceData.forEach(function(comp) {
  totalBehaviors += comp.behaviors.length;
});
console.log('总行为指标数量:', totalBehaviors);  // 应为 113

// 检查所有行为指标ID唯一性
var behaviorIds = [];
competenceData.forEach(function(comp) {
  comp.behaviors.forEach(function(b) {
    if (behaviorIds.indexOf(b.id) !== -1) {
      console.error('重复的行为指标ID:', b.id);
    }
    behaviorIds.push(b.id);
  });
});
```

---

## 注意事项

1. **保持数据准确性**：不要修改原始内容的含义
2. **完整性优先**：确保所有数据都被转换，不遗漏
3. **格式一致性**：严格按照模板格式输出
4. **代码可读性**：适当使用缩进和注释
5. **离线可用**：生成的数据文件将用于离线环境，必须自包含

---

## 交付物

请提供：
1. 完整的 `competence-data.js` 文件
2. 简要说明转换过程中的注意事项或特殊处理

---

祝转换顺利！如有疑问，请随时询问。
