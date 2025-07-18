# 通信失效程序文档转换AI提示词

## 🎯 任务描述

请将提供的英文通信失效程序文档转换为微信小程序兼容的JavaScript数据格式，要求包含英文原文和中文翻译，格式需完全兼容现有系统。

**⚠️ 重要筛选原则：只输出有ICAO差异的国家/地区，不要输出仅声明"符合ICAO标准"的国家。**

## 📥 输入要求

- 英文PDF/文档内容（来源于各地区 AIRWAY MANUAL 中的"ICAO DIFFERENCES OR STATE SPECIAL PROCEDURES - COMMUNICATIONS FAILURE"部分）
- 明确指出文档来源地区（8个AIRWAY MANUAL之一：AFRICA, EASTERN EUROPE, EUROPE, GENERAL, MIDDLE EAST, NORTH AMERICA, PACIFIC, SOUTH AMERICA）
- 包含的国家列表

## 📤 标准输出格式

```javascript
/**
 * ICAO Communication Failure Procedures Differences or Special Procedures - [地区名称]
 *
 * @remarks
 * This data is extracted from the [地区名称] AIRWAY MANUAL for reference only.
 * Before actual operation, please be sure to refer to the complete official and latest documentation.
 *
 * @dataSource [地区名称]_airway_manual.pdf
 *
 * @version 1.0.0
 * @date [当前日期 YYYY-MM-DD]
 */
const ICAO_DIFFERENCES_COMM_FAILURE_[地区名称] = {
    "[COUNTRY_CODE]": {
        "region_name_en": "[ENGLISH_COUNTRY_NAME]",
        "region_name_cn": "[中文国家名]",
        "icao_differences": {
            "en": "[Brief summary of key differences from ICAO standard]",
            "cn": "[与ICAO标准的主要差异简述]"
        },
        "procedures": [
            {
                "en": "[Complete English procedure text without references]",
                "cn": "[完整的中文程序文本，无引用标记]"
            },
            {
                "en": "[Another complete English procedure...]",
                "cn": "[另一个完整的中文程序...]"
            }
            // 根据实际内容添加更多程序
        ]
    },
    // 更多国家...
};

// 导出模块
module.exports = {
    ICAO_DIFFERENCES_COMM_FAILURE_[地区名称]
};
```

## 🔧 具体转换要求

### 1. 文档内容筛选原则

**⚠️ 关键要求：只输出有ICAO差异的国家/地区**

**A. 需要排除的基础声明**（完全不要输出）
如果某国家/地区只有以下类型的基础声明，则**完全不要包含**在输出中：

```javascript
// ❌ 这种只有基础声明的国家不要输出
{
    "en": "In general, the Emergency, Unlawful Interference, Communications Failure, Interception and Search and Rescue procedures are in conformity with the Standards, Recommended Practices and Procedures contained in ICAO Annexes and Documents.",
    "cn": "总则：在紧急情况、非法干扰、通信失效、拦截和搜救程序方面，通常符合ICAO标准、建议措施和程序。"
}

// ❌ 这种"与ICAO一致但提供本地程序"的国家也要排除
{
    "icao_differences": {
        "en": "Consistent with ICAO but provides specific local procedures",
        "cn": "与ICAO一致，但提供了具体的本地程序"
    }
}

// ❌ 这种"与ICAO一致但规定了XX分钟和XX分钟"的国家也要排除
{
    "icao_differences": {
        "en": "Specifies a 20-minute rule for procedural airspace and a 7-minute rule for radar-controlled airspace, consistent with ICAO",
        "cn": "规定了程序空域的20分钟规则和雷达管制空域的7分钟规则，与ICAO一致"
    }
}

// ❌ 这种引用其他章节的程序也要排除
{
    "en": "In the event of failure of two-way radio communication, the pilot must proceed in accordance with the normal radio failure procedures published in the EMERGENCY Section.",
    "cn": "如果双向无线电通信失效，飞行员必须按照EMERGENCY章节中公布的正常无线电失效程序执行。"
}
```

**B. 需要输出的差异类型**（有这些才输出）
必须包含**具体可操作的飞行程序**，而不是简单的政策声明。每个国家必须至少包含以下一种或多种具体差异：

1. **具体应答机操作程序**

   - 特殊代码及设置时机（如7000, 2000, 7700）
   - 代码变更的具体条件和步骤
2. **详细时间要求和程序**

   - 具体等待时间（7分钟、20分钟、60分钟等）
   - 计时起点的明确定义
   - 时间到达后的具体操作步骤
3. **逐步操作程序**

   - VMC条件下的具体飞行步骤
   - IMC条件下的详细程序
   - 高度和速度保持的具体规定
4. **导航和航路程序**

   - 特定导航设备的使用方法
   - 航路重新加入的具体步骤
   - 等待程序的详细规定
5. **进近和着陆程序**

   - 下降开始的具体时机
   - 进近程序的选择标准
   - 着陆时间窗口的计算
6. **通信恢复程序**

   - 频率选择的优先级
   - 盲发内容的具体要求
   - 其他通信方式的尝试步骤
7. **特殊空域和机场程序**

   - 海洋空域的特殊操作
   - 特定机场的独特要求
   - 雷达引导失效后的程序

**⚠️ 关键要求：每个程序必须包含飞行员可以直接执行的具体步骤，如：**

- "保持最后分配的高度或最低飞行高度（如果更高）7分钟"
- "飞往VORDME 'PDV'或LCTR 'PD'，高度7000英尺"
- "等待至少7分钟后，自行决定执行进近程序"

**❌ 严禁的不完整内容：**

- 使用省略号"..."替代具体程序步骤
- 只引用其他章节而不提供具体操作（如"按照EMERGENCY章节程序"）
- 空泛的政策声明替代具体飞行动作
- 缺少关键参数（时间、高度、频率、代码等）的程序描述
- **差异简述与程序内容不一致**（如简述说7700，程序内容却说7600）
- 混入非通信失效程序（如应急偏航、燃油泄漏、发动机故障等程序）
- **混入拦截程序**（如设置7700代码应对拦截等非通信失效程序）

### 8. **ICAO差异简述要求**

**必须添加 `icao_differences` 字段，简要说明与ICAO标准的主要差异：**

- **必填字段**：每个国家都必须包含 `icao_differences` 字段
- **简洁明确**：用一句话概括主要差异，避免冗长描述
- **量化表述**：包含具体的时间、代码、程序等参数

## 📋 ICAO Doc 4444 第15.3节标准程序（对比基准）

### 英文原文关键程序：

```
a) if in visual meteorological conditions:
   1) continue to fly in visual meteorological conditions;
   2) land at the nearest suitable aerodrome; and
   3) report its arrival by the most expeditious means to the appropriate air traffic control unit;

b) if in instrument meteorological conditions or when conditions are such that it does not appear likely that the pilot will complete the flight in accordance with a):
   1) in airspace where procedural separation is being applied, maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 20 minutes following the aircraft's failure to report its position over a compulsory reporting point;
   2) in airspace where an ATS surveillance system is used, maintain the last assigned speed and level, or minimum flight altitude if higher, for a period of 7 minutes following:
      i) the time the last assigned level or minimum flight altitude is reached; or
      ii) the time the transponder is set to Code 7600 or the ADS-B transmitter is set to indicate the loss of air-ground communications; or
      iii) the aircraft's failure to report its position over a compulsory reporting point;
      whichever is later;
   3) when being vectored or having been directed by ATC to proceed offset using RNAV without a specified limit, proceed in the most direct manner possible to rejoin the current flight plan route no later than the next significant point;
   4) proceed according to the current flight plan route to the appropriate designated navigation aid or fix serving the destination aerodrome and hold over this aid or fix until commencement of descent;
   5) commence descent at, or as close as possible to, the expected approach time last received and acknowledged; or, if no expected approach time has been received and acknowledged, at, or as close as possible to, the estimated time of arrival resulting from the current flight plan;
   6) complete a normal instrument approach procedure;
   7) land, if possible, within 30 minutes after the estimated time of arrival or the last acknowledged expected approach time, whichever is later.
```

### 中文标准程序：

```
a) 如果在目视气象条件下：
   1) 继续保持目视气象条件飞行；
   2) 在最近的合适机场着陆；和
   3) 用最迅速的手段向有关空中交通管制单位报告其到达信息；

b) 如果在仪表气象条件下，或在驾驶员似乎不能按a)完成飞行的条件下：
   1) 在采用程序间隔的空域，当航空器未能在强制报告点上空报告其位置时，保持最后指定的速度与高度层，或当最低飞行高度更高时则保持最低飞行高度，飞行20分钟；
   2) 在使用ATS监视系统提供空中交通管制的空域，在出现下列情况后，保持最后指定的速度与高度层，或当最低飞行高度更高时则保持最低飞行高度，飞行7分钟：
      i) 达到了最后指定的高度层或达到最低飞行高度时；或
      ii) 应答机设为编码7600或ADS-B发报机被设定表示失去空地通信联络时；或
      iii) 航空器未能在强制报告点上空报告其位置；
      以较晚者为准；
   3) 在接受引导或由空中交通管制指示使用区域导航（RNAV）、在无规定限制的情况下进行偏移时，以最直接的方式前行，以便在到达下一个重要点之前重新加入现行飞行计划的航路；
   4) 按照现行飞行计划航路，继续向前飞行到指定为预定着陆服务的有关导航设备或定位点上空，并且当要求保证按5)实施时，在此导航设备或定位点上空等待至开始下降；
   5) 在或尽可能接近于最后收到和确认的预期进近时间，或未收到和确认的预期进近时间时，在或尽可能接近于现行飞行计划中的预计到达时间，开始从4)中所述的导航设备或定位点上空下降；
   6) 按照指定的导航设备或定位点规定的程序，完成正常的仪表进近；和
   7) 可能时，取下述晚者，或在5)中所述的预计到达时间或最后确认的预期进近时间之后的30分钟内着陆。
```

**ICAO标准程序关键点（作为对比基准）：**

- **应答机代码**：7600（Mode A）
- **VMC条件**：继续VMC飞行，最近合适机场着陆，报告到达
- **IMC条件**：程序间隔保持20分钟，ATS监视保持7分钟
- **7分钟计时起点**：达到高度、设置7600代码、未报告强制报告点三者中较晚者
- **下降时机**：按EAT或ETA开始
- **着陆时限**：30分钟内

**差异简述必须具体且量化，应包含：**

- **应答机代码差异**：如"使用应答机代码7600进行通信故障指示" / "起飞前必须具备双向通信"
- **时间差异**：如"海洋空域60分钟规则替代标准20分钟" / "10分钟规则不同于ICAO的7或20分钟" 
- **程序差异**：如"7分钟计时仅考虑两个条件，省略第三个ICAO条件" / "特定机场详细STAR进场程序"
- **特殊要求**：如"明确允许SLOP程序" / "国内空域5分钟规则后恢复计划高度"

**❌ 避免模糊表述：**

- "程序与ICAO标准一致，但提供了具体指示" ← 太模糊
- "包含详细的通讯用语" ← 不是关键差异
- "符合ICAO标准" ← 不应该包含此类国家
- "与ICAO一致但提供本地程序" ← 应该排除的国家
- "规定了XX分钟和XX分钟，与ICAO一致" ← 应该排除的国家

**⚠️ 重要一致性检查：**

- **差异简述必须与程序内容完全一致**
- 如简述提到特定代码（如7700），程序中必须使用相同代码
- 如简述提到特定时间（如10分钟），程序中必须体现相同时间
- **只包含通信失效相关程序**，排除应急偏航、燃油问题、发动机故障等非通信失效程序
- **严禁混入拦截程序**（如7700代码应对拦截），只专注于通信失效7600程序

### 2. 必需的格式要求

#### 2.1 国家代码规范

- 使用全大写英文国家名作为键（如：`"AUSTRALIA"`, `"NEW_ZEALAND"`）
- 特殊情况：`"US_PAC_TERRITORIES"`, `"KOREA_REPUBLIC_OF"`

#### 2.2 引用标记处理

- **不保留引用标记**：移除所有 `[cite: XX]` 引用标记
- **内容完整性**：确保移除引用后程序内容仍然完整可理解
- **关键信息保留**：重要的程序步骤和参数必须在正文中明确表述

#### 2.3 程序内容处理规则

**必须提取具体可操作的程序步骤：**

**VMC程序（需包含完整操作流程）：**

- 具体飞行操作："continue to fly in visual meteorological conditions"
- 机场选择："land at the nearest suitable aerodrome where safe landing is possible"
- 报告要求："report its arrival to the appropriate ATC unit expeditiously"

**IMC程序（需包含精确时间和高度规定）：**

- 时间规定："maintain for 20 minutes following failure to report over compulsory reporting point"
- 高度维持："last assigned altitude or minimum altitude (MEA, MOCA, MRA), whichever is higher"
- 计时起点："7 minutes following the time last assigned altitude is reached OR transponder set to 7600"

**导航程序（需包含具体设备和位置）：**

- 导航设备："proceed to VORDME 'PDV' or LCTR 'PD' at 7000ft"
- 等待程序："hold for minimum 7 minutes then execute approach at your discretion"
- 航路重新加入："rejoin the last cleared route by most direct manner"

**应答机操作（需包含具体代码和时机）：**

- 代码设置："set transponder to Code 7600 immediately upon communication failure"
- 特殊代码："Squawk 7000 as uncontrolled flight" / "Code 2000 five minutes before border crossing"

**通信程序（需包含具体频率和内容）：**

- 频率尝试："attempt alternative then secondary ATS frequencies"
- 紧急频率："use emergency frequency 121.5 MHz for blind transmission"
- 监听要求："monitor ATIS and VORDME frequency of landing aerodrome"

### 3. 翻译质量标准

#### 3.1 专业术语对照表

| 英文                                       | 中文翻译                  |
| ------------------------------------------ | ------------------------- |
| Visual Meteorological Conditions (VMC)     | 目视气象条件 (VMC)        |
| Instrument Meteorological Conditions (IMC) | 仪表气象条件 (IMC)        |
| Air Traffic Control (ATC)                  | 空中交通管制 (ATC)        |
| Expected Approach Time (EAT)               | 预计进近时间 (EAT)        |
| Estimated Time of Arrival (ETA)            | 预计到达时间 (ETA)        |
| Minimum Safe Altitude (MSA)                | 最低安全高度 (MSA)        |
| Strategic Lateral Offset Procedures (SLOP) | 战略性横向偏航程序 (SLOP) |
| Mandatory Broadcast Zone (MBZ)             | 强制广播区 (MBZ)          |

#### 3.2 翻译准确性要求

- 时间表述：保持数字一致（"20 minutes" → "20分钟"）
- 高度单位：保持原文单位（"FL4000" → "4000英尺"）
- 频率信息：保持数字格式（"121.5 MHz" → "121.5 MHz"）

### 4. 文件命名和结构

#### 4.1 文件命名规则

- 非洲地区：`africa.js` (AFRICA AIRWAY MANUAL)
- 东欧地区：`eastern_europe.js` (EASTERN EUROPE AIRWAY MANUAL)
- 欧洲地区：`europe.js` (EUROPE AIRWAY MANUAL)
- 通用地区：`general.js` (GENERAL AIRWAY MANUAL)
- 中东地区：`middle_east.js` (MIDDLE EAST AIRWAY MANUAL)
- 北美地区：`north_america.js` (NORTH AMERICA AIRWAY MANUAL)
- 太平洋地区：`pacific.js` (PACIFIC AIRWAY MANUAL)
- 南美地区：`south_america.js` (SOUTH AMERICA AIRWAY MANUAL)

#### 4.2 变量命名规则

```javascript
const ICAO_DIFFERENCES_COMM_FAILURE_AFRICA = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_EASTERN_EUROPE = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_EUROPE = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_GENERAL = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_MIDDLE_EAST = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_NORTH_AMERICA = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_PACIFIC = { ... };
const ICAO_DIFFERENCES_COMM_FAILURE_SOUTH_AMERICA = { ... };
```

## 📝 具体处理指南

### 输入文档分析步骤

1. **识别文档地区** - 确定是哪个地区的 AIRWAY MANUAL 文档
2. **提取国家列表** - 找出所有涉及的国家/地区
3. **内容分类处理** - 区分基础声明和详细程序
4. **引用信息保留** - 确保所有引用编号正确

### 输出内容要求

```javascript
// 示例输出开头说明
"处理地区：太平洋地区 (PACIFIC)"
"文档中包含国家：澳大利亚、斐济、印度尼西亚、马来西亚、新西兰、巴布亚新几内亚、美国太平洋属地、日本、韩国、新加坡、台湾、泰国"
"有ICAO差异的国家：澳大利亚、印度尼西亚、马来西亚、新西兰、巴布亚新几内亚、日本、韩国、新加坡、台湾、泰国"
"已排除（仅基础声明）：斐济、美国太平洋属地"
"主要特点：包含详细的海洋空域程序、VMC/IMC差异化处理、特殊时间要求"
"与ICAO差异：澳大利亚海洋空域60分钟规则、日本详细分类程序、韩国特殊应答机代码7700"
```

## 🎯 微信小程序兼容性

### 数据访问模式

```javascript
// 页面中的使用方式
const pacificData = require('../../packageCommunication/pacific.js');
const australiaProcs = pacificData.ICAO_DIFFERENCES_COMM_FAILURE_PACIFIC.AUSTRALIA;

// 遍历显示
australiaProcs.procedures.forEach((proc, index) => {
    console.log(`程序 ${index + 1}:`);
    console.log(`英文: ${proc.en}`);
    console.log(`中文: ${proc.cn}`);
});
```

### UI显示考虑

- 每个程序段落独立显示
- 支持中英文切换显示
- 引用信息可选显示
- 支持关键词搜索

## ⚠️ 特殊情况处理

### 1. 内容不明确时

```javascript
{
    "en": "[需要确认：原文表述不清楚] Original unclear text",
    "cn": "[需要确认：翻译可能有误] 翻译内容"
}
```

### 2. 某国无特殊程序时

```javascript
"COUNTRY_NAME": {
    "region_name_en": "COUNTRY NAME",
    "region_name_cn": "国家中文名",
    "procedures": [
        {
            "en": "In general, the Emergency, Unlawful Interference, Communications Failure, Interception and Search and Rescue procedures are in conformity with the Standards, Recommended Practices and Procedures contained in ICAO Annexes and Documents.",
            "cn": "总则：在紧急情况、非法干扰、通信失效、拦截和搜救程序方面，通常符合ICAO标准、建议措施和程序。"
        }
    ]
}
```

### 3. 长段落文本处理

- 如果单个程序超过500字，考虑拆分为多个条目
- 保持逻辑完整性，按意群分割
- 确保引用信息正确对应

## 📋 使用示例

### 完整提示词模板

```
# 任务说明
请将以下AIRWAY MANUAL地区文档中的通信失效程序转换为JavaScript格式，完全按照提供的格式要求输出。

**⚠️ 重要筛选和详细程度要求：**
1. **只输出有ICAO差异的国家**，不要输出仅声明"符合ICAO标准"的国家
2. **必须包含具体可操作的飞行程序**，飞行员看到后能直接执行
3. **详细程序优于简单声明**，要提取完整的操作步骤和时间规定
4. **严禁使用省略号或引用其他章节**，必须提供完整的具体步骤
5. **差异简述必须量化和具体**，避免"符合标准但提供指示"等模糊表述

# 输入信息
- **文档地区**: [8个AIRWAY MANUAL之一：AFRICA / EASTERN EUROPE / EUROPE / GENERAL / MIDDLE EAST / NORTH AMERICA / PACIFIC / SOUTH AMERICA]
- **文档来源**: [地区名] AIRWAY MANUAL
- **涉及国家**: [列出所有国家名]

# 要求严格按照以下格式输出

[将上面的标准输出格式粘贴到这里]

# 原始英文文档内容
[粘贴原文档内容]

# 特别注意
1. **筛选原则：只输出有ICAO差异的国家，排除仅基础声明的国家**
2. **详细程度：必须包含飞行员可直接执行的具体操作步骤**
3. **完整性：提取完整的时间规定、高度要求、导航程序等**
4. **严禁省略：不得使用"..."或引用其他章节，必须写出完整具体步骤**
5. **差异简述具体化：必须包含量化的、可操作的差异描述**
6. **确保一致性：差异简述与程序内容必须完全一致，特别是代码、时间等参数**
7. **限定范围：只包含通信失效程序，排除应急偏航、燃油、发动机等其他应急程序**
8. **严禁混入拦截程序：排除7700代码应对拦截等非通信失效程序**
9. **排除"与ICAO一致但提供本地程序"：这类国家应该完全排除不输出**
10. **移除所有引用标记**：不保留 [cite: XX] 格式，确保程序内容完整可理解
11. 确保英文和中文完全对应
12. 按程序段落合理分割，保持逻辑完整性
13. 保持专业术语翻译一致性
14. 在输出开头说明排除了哪些国家
```

### 质量检查清单

转换完成后，请验证：

- [ ] **已排除仅基础声明的国家（只有"符合ICAO标准"声明的）**
- [ ] **已排除"与ICAO一致但提供本地程序"的国家**
- [ ] **已排除"规定XX分钟和XX分钟，与ICAO一致"的国家**
- [ ] **只包含有具体ICAO差异的国家**
- [ ] **无省略号"..."或章节引用，所有程序步骤完整具体**
- [ ] **差异简述量化且具体（包含时间、代码、频率等参数）**
- [ ] **每个程序包含飞行员可直接执行的操作步骤**
- [ ] **差异简述与程序内容完全一致（代码、时间、频率等参数）**
- [ ] **只包含通信失效相关程序，排除其他应急程序**
- [ ] **已排除拦截程序（7700代码应对拦截等）**
- [ ] 文件头部注释信息完整
- [ ] 所有输出国家都有英文和中文名称
- [ ] procedures数组格式正确
- [ ] 移除所有引用标记 [cite: XX]，程序内容完整
- [ ] 专业术语翻译准确
- [ ] 导出模块格式正确
- [ ] 在输出开头说明了排除的国家

## 📋 理想输出示例

基于 `pacific.js` 的正确格式示例：

```javascript
"AUSTRALIA": {
    "region_name_en": "AUSTRALIA",
    "region_name_cn": "澳大利亚",
    "icao_differences": {
        "en": "Specifies a 60-minute rule for oceanic airspace instead of the standard 20 minutes and explicitly allows for Strategic Lateral Offset Procedures (SLOP).",
        "cn": "在海洋空域规定了60分钟的等待规则，以替代标准的20分钟，并明确允许执行战略性横向偏航程序 (SLOP)。"
    },
    "procedures": [
        {
            "en": "If in VMC and are certain of maintaining VMC, stay in VMC and land at the most suitable airport.",
            "cn": "如果在目视气象条件下（VMC）并确信能保持VMC，则应保持VMC飞行并在最合适的机场着陆。"
        },
        {
            "en": "In the event of total loss of communication, an aircraft shall: maintain the last assigned speed and level for a period of 60 minutes following the aircraft's failure to report its position over a compulsory reporting point (including ADS-C flights), and thereafter adjust speed and altitude in accordance with the filed flight plan.",
            "cn": "如果通信完全中断，飞机应：在强制报告点未能报告其位置后，保持最后分配的速度和高度层飞行60分钟（包括ADS-C航班），然后根据所提交的飞行计划调整速度和高度。"
        }
    ]
},

"JAPAN": {
    "region_name_en": "JAPAN",
    "region_name_cn": "日本",
    "icao_differences": {
        "en": "The 7-minute rule for radar airspace only considers two conditions for the timer start (altitude reached or transponder set to 7600), omitting the third ICAO condition (failure to report). Descent timing is based on total flight plan time if EAT/ETA is unavailable.",
        "cn": "雷达空域的7分钟计时规则仅考虑两个计时起点（达到高度或设置应答机7600），省略了ICAO标准的第三个条件（未能报告位置）。在没有EAT/ETA的情况下，下降时机基于飞行计划的总时间。"
    },
    "procedures": [
        {
            "en": "In airspace where radar is used in the provision of air traffic control, for a period of 7 minutes following: the time the last assigned altitude or minimum altitude is reached; or the time the transponder is set to Code 7600 whichever is later.",
            "cn": "在提供空中交通管制的雷达空域，在最后分配的高度或最低高度到达之时，或应答机设置为7600编码之时（以较晚者为准）起，保持7分钟。"
        }
    ]
},

"KOREA_REPUBLIC_OF": {
    "region_name_en": "KOREA, REPUBLIC OF",
    "region_name_cn": "大韩民国",
    "icao_differences": {
        "en": "Mandatory requirement for two-way radio communications to be functional before any aircraft is permitted to take off.",
        "cn": "强制性要求，任何飞机在起飞前必须能够与空中交通管制保持双向无线电通信。"
    },
    "procedures": [
        {
            "en": "No person may take off unless two-way radio communications can be maintained with Air Traffic Control.",
            "cn": "除非能够与空中交通管制保持双向无线电通信，否则任何人不得起飞。"
        },
        {
            "en": "On recognition of communication failure during flight, squawk 7600 and if necessary to ensure safe altitude, climb to Minimum Safe Altitude or above to maintain obstacle clearance.",
            "cn": "在飞行中识别到通信故障时，应设置应答机编码7600，并在必要时为确保安全高度，爬升至最低安全高度或以上以保持障碍物越障能力。"
        }
    ]
}
```

**对比：不合格的简化版本 ❌**

以下示例展示了**不符合要求**的输出，这些都应该避免：

```javascript
// ❌ 问题1：使用省略号，程序不完整
"NEW_ZEALAND": {
    "icao_differences": {
        "en": "Procedures align with ICAO standards but provide specific instructions...",
        "cn": "程序与ICAO标准一致，但提供了具体指示..."
    },
    "procedures": [
        {
            "en": "maintain the last assigned speed and level for a period of 60 minutes...and thereafter adjust...",
            "cn": "保持最后分配的速度和高度60分钟...然后调整..."
        }
    ]
}

// ❌ 问题2：引用其他章节，缺少具体步骤
"AUSTRALIA": {
    "procedures": [
        {
            "en": "In the event of failure of two-way radio communication, the pilot must proceed in accordance with the normal radio failure procedures published in the EMERGENCY Section.",
            "cn": "如果双向无线电通信失效，飞行员必须按照EMERGENCY章节中公布的正常无线电失效程序执行。"
        }
    ]
}

// ❌ 问题3：差异简述过于模糊
"SINGAPORE": {
    "icao_differences": {
        "en": "Procedures align with ICAO standards but provide specific instructions for different flight phases",
        "cn": "程序与ICAO标准一致，但针对不同飞行阶段提供了具体指示"
    }
}

// ❌ 问题4：应该被排除的国家（仅基础声明）
"SOME_COUNTRY": {
    "procedures": [
        {
            "en": "In general, the Emergency, Unlawful Interference, Communications Failure, Interception and Search and Rescue procedures are in conformity with the Standards, Recommended Practices and Procedures contained in ICAO Annexes and Documents.",
            "cn": "总则：在紧急情况、非法干扰、通信失效、拦截和搜救程序方面，通常符合ICAO附件和文件中包含的标准、建议措施和程序。"
        }
    ]
}

// ❌ 问题5：差异简述与程序内容不一致
"KOREA_REPUBLIC_OF": {
    "icao_differences": {
        "en": "Uses transponder code 7700 for communication failure",
        "cn": "通信失效时使用应答机代码7700"
    },
    "procedures": [
        {
            "en": "set the transponder to Mode A Code 7600",  // ← 与简述矛盾！
            "cn": "将应答机设置为A模式，编码7600"
        }
    ]
}

// ❌ 问题6：混入非通信失效程序
"SOME_COUNTRY": {
    "icao_differences": {
        "en": "Special emergency offset procedures for fuel leaks",
        "cn": "燃油泄漏特殊应急偏航程序"  // ← 这不是通信失效程序！
    }
}
```

---

模版示例：europe.js
