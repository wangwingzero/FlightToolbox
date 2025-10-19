# 权威定义数据管理指南

## 📋 目录概述

本目录包含航空专业术语的权威定义数据，来源于多个官方文件：

| 文件名 | 数据来源 | 条目数 | 状态 |
|--------|---------|--------|------|
| `definitions.js` | ICAO附件、基础定义 | 427 | ✅ |
| `AC-91-FS-001R2.js` | AC-91-FS-001R2咨询通告 | 64 | ✅ |
| `AC-91-FS-2020-016R1.js` | AC-91-FS-2020-016R1咨询通告 | 0 | 待添加 |
| `AC-121-FS-33R1.js` | AC-121-FS-33R1咨询通告 | 0 | 待添加 |
| `AC-121-FS-41R1.js` | AC-121-FS-41R1 CRM训练 | 0 | 待添加 |
| `CCAR-121-R8.js` | CCAR-121-R8规章 | 0 | 待添加 |
| `AC-121-50R2.js` | AC-121-50R2地面结冰 | 0 | 待添加 |

**总计**：491条定义

---

## 🚨 重要警告：避免重复ID

### 问题背景

2025年发现数据中存在**419个重复ID**，导致：
- ❌ 微信开发者工具警告：`Do not set same key in wx:key`
- ❌ 列表渲染性能下降
- ❌ 点击定义时可能打开错误的项
- ❌ 搜索结果混乱

### 根本原因

**复制粘贴数据时未修改ID**，导致同一个ID在多个定义中重复使用。

---

## ✅ 添加新定义的正确方法

### 方法一：使用ID生成工具（推荐）

在本目录下提供了 `generate-definition-template.js` 工具：

```bash
# 生成单个定义模板
node generate-definition-template.js

# 生成多个定义模板（指定数量）
node generate-definition-template.js 10
```

**输出示例：**
```javascript
{
  "id": "a3f7b2e1-4c8d-4a5e-9f2b-7d3e8a1c5f6b", // 自动生成的唯一ID
  "chinese_name": "",
  "english_name": "",
  "definition": "",
  "source": ""
}
```

### 方法二：在线UUID生成器

访问以下任一网站生成UUID v4：
- https://www.uuidgenerator.net/
- https://www.guidgenerator.com/
- https://uuid.online/

### 方法三：使用编程语言生成

**JavaScript (Node.js):**
```javascript
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log(generateUUID());
```

**Python:**
```python
import uuid
print(str(uuid.uuid4()))
```

---

## 📝 数据格式规范

### 标准定义格式

```javascript
{
  "id": "唯一的UUID v4格式",                    // 必填，36字符UUID
  "chinese_name": "中文术语名称",                // 必填
  "english_name": "English Term Name",         // 可选，但建议填写
  "definition": "术语的权威定义内容...",         // 必填
  "source": "《国际民用航空公约》附件6"           // 必填，数据来源
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | String | ✅ | UUID v4格式唯一标识符 | `"a3f7b2e1-4c8d-4a5e-9f2b-7d3e8a1c5f6b"` |
| `chinese_name` | String | ✅ | 中文术语名称 | `"精密进近"` |
| `english_name` | String | ⚠️ | 英文术语名称（建议填写） | `"Precision Approach"` |
| `definition` | String | ✅ | 术语的权威定义 | `"使用仪表着陆系统......"` |
| `source` | String | ✅ | 数据来源文件 | `"《国际民用航空公约》附件6"` |

### 完整示例

```javascript
module.exports = [
  {
    "id": "18f0a0d1-196d-4e9e-8c4d-2a1f8c1b3f9a",
    "chinese_name": "1级性能运行",
    "english_name": "Operations in performance Class 1",
    "definition": "具有以下性能的运行，即在临界发动机失效的情况下，具有使直升机继续安全飞行到合适着陆区的性能，除非上述发动机失效情况发生在达到起飞决断点（TDP）之前或通过着陆决断点（LDP）之后，在这两种情况下，直升机必须能够在中断起飞或着陆区内着陆。",
    "source": "《国际民用航空公约》附件6"
  },
  {
    "id": "e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b",
    "chinese_name": "2级性能运行",
    "english_name": "Operations in performance Class 2",
    "definition": "具有以下性能的运行，即在临界发动机失效的情况下，具有使直升机继续安全飞行到合适着陆区的性能，除非上述发动机失效情况早在起飞阶段或迟至着陆阶段发生，在这两种情况下，直升机可能必须实施迫降。",
    "source": "《国际民用航空公约》附件6"
  }
];
```

---

## 🔍 检查重复ID的方法

### 方法一：使用检查脚本

在本目录下提供了 `check-duplicate-ids.js` 检查工具：

```bash
node check-duplicate-ids.js
```

**输出示例：**
```
🔍 开始扫描重复ID...

✅ definitions.js: 找到 427 个ID
✅ AC-91-FS-001R2.js: 找到 64 个ID

📊 统计结果:
   总ID数量: 491
   重复ID数量: 0

✅ 未发现重复ID，数据完整！
```

### 方法二：手动检查

**在代码编辑器中搜索：**
1. 打开所有 `.js` 数据文件
2. 使用正则搜索：`"id":\s*"([^"]+)"`
3. 检查是否有重复的UUID

**在终端中检查：**
```bash
# 统计所有ID及其出现次数
grep -h '"id":' *.js | sort | uniq -c | sort -rn

# 只显示重复的ID（出现次数>1）
grep -h '"id":' *.js | sort | uniq -c | sort -rn | awk '$1 > 1'
```

---

## 🛠️ 工具脚本说明

本目录包含以下工具脚本：

### 1. `generate-definition-template.js`
**用途**：生成带有唯一ID的定义模板

**使用方法：**
```bash
# 生成1个定义模板
node generate-definition-template.js

# 生成10个定义模板
node generate-definition-template.js 10
```

**输出**：将模板直接打印到控制台，复制粘贴到数据文件中使用

---

### 2. `check-duplicate-ids.js`
**用途**：检查所有数据文件中是否存在重复的ID

**使用方法：**
```bash
node check-duplicate-ids.js
```

**输出**：
- ✅ 未发现重复：显示绿色成功消息
- 🚨 发现重复：显示所有重复ID的详细信息

---

### 3. `fix-duplicate-ids.js`（已废弃）
**用途**：自动修复重复的ID（仅在发现重复时使用）

**说明**：此脚本已在2025-10-19运行过一次，修复了419个重复ID。正常情况下不需要再次运行。如果未来再次出现重复ID，可以运行此脚本自动修复。

---

## 📚 最佳实践

### 添加新定义时的检查清单

- [ ] 1. 使用工具生成唯一ID（不要手动编写或复制旧ID）
- [ ] 2. 填写所有必填字段（id, chinese_name, definition, source）
- [ ] 3. 尽量填写英文名称（english_name）
- [ ] 4. 确保source字段准确标注数据来源
- [ ] 5. 运行 `node check-duplicate-ids.js` 检查ID唯一性
- [ ] 6. 在微信开发者工具中测试页面，确认无警告

### 批量添加定义的流程

```bash
# 1. 生成模板（假设要添加20条定义）
node generate-definition-template.js 20 > temp_definitions.json

# 2. 编辑temp_definitions.json，填写实际数据

# 3. 将数据合并到目标文件（例如definitions.js）
#    手动复制粘贴，或使用脚本合并

# 4. 检查ID唯一性
node check-duplicate-ids.js

# 5. 如果发现重复，手动修改或运行修复脚本
# node fix-duplicate-ids.js  （仅在必要时使用）

# 6. 提交代码前再次检查
node check-duplicate-ids.js
```

### 数据维护建议

1. **每次添加数据后立即检查**
   ```bash
   node check-duplicate-ids.js
   ```

2. **提交代码前运行检查**
   - 将检查脚本加入Git pre-commit hook
   - 确保提交的数据没有重复ID

3. **定期备份数据**
   - 数据文件较大，建议定期备份
   - 修改前先复制一份备份

4. **文档化数据来源**
   - 在source字段准确标注
   - 必要时在本README中记录详细来源信息

---

## 🐛 故障排除

### 问题：微信开发者工具警告 `Do not set same key in wx:key`

**原因**：数据中存在重复的ID

**解决方案：**
```bash
# 1. 运行检查脚本
node check-duplicate-ids.js

# 2. 如果发现重复ID，查看详细信息
#    脚本会列出所有重复的ID及其位置

# 3. 手动修改重复的ID，或运行修复脚本
node fix-duplicate-ids.js

# 4. 再次检查确认已修复
node check-duplicate-ids.js
```

### 问题：数据加载失败

**可能原因：**
- JSON格式错误（缺少逗号、引号不匹配等）
- 文件编码问题（应使用UTF-8编码）

**检查方法：**
```bash
# 检查JavaScript语法
node -c definitions.js

# 或在Node.js中加载测试
node -e "const data = require('./definitions.js'); console.log('数据条数:', data.length);"
```

---

## 📊 数据统计

最后更新：2025-10-19

| 指标 | 数值 |
|------|------|
| 总数据文件 | 7个 |
| 总定义条目 | 491条 |
| 重复ID数量 | 0（已修复） |
| 数据来源 | ICAO附件、CCAR规章、AC咨询通告 |

---

## 📞 联系方式

如有问题或建议，请联系项目维护者。

---

## 📜 更新日志

### 2025-10-19
- ✅ 修复了419个重复ID问题
- ✅ 创建了本README文档
- ✅ 添加了ID生成和检查工具脚本

---

**⚠️ 重要提醒：每次添加新定义时，请务必使用工具生成唯一ID，并在提交前运行检查脚本！**
