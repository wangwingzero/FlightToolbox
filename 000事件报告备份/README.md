# 事件报告代码备份

**备份时间**: 2025-11-08
**备份原因**: 代码回档前保留事件报告当前版本

## 备份内容

### 核心代码文件

1. **初步报告页面** (`packageO/event-report/initial-report.*`)
   - `initial-report.js` - 主逻辑文件
   - `initial-report.json` - 页面配置
   - `initial-report.wxml` - 页面模板
   - `initial-report.wxss` - 页面样式
   - `initial-report.wxml.backup` - 模板备份

2. **历史记录页面** (`packageO/event-report/history.*`)
   - `history.ts` - TypeScript 逻辑文件
   - `history.json` - 页面配置
   - `history.wxml` - 页面模板

3. **数据文件** (`packageO/data/`)
   - `event-types.js` - 事件类型定义

### 文档文件

- `AC-396-03R2事件信息填报和处理规范.md` - 规范文档
- `上海飞行部事件信息报告规定202507版.md` - 公司规定

## 使用说明

代码回档后，如需恢复事件报告功能，按以下步骤操作：

1. **复制核心代码**
   ```bash
   cp -r 000事件报告备份/miniprogram/packageO/event-report/* miniprogram/packageO/event-report/
   cp 000事件报告备份/miniprogram/packageO/data/event-types.js miniprogram/packageO/data/
   ```

2. **检查 app.json 配置**
   确保 `miniprogram/app.json` 中包含事件报告页面路径：
   ```json
   {
     "subPackages": [
       {
         "root": "packageO",
         "pages": [
           "event-report/initial-report",
           "event-report/history"
         ]
       }
     ]
   }
   ```

3. **验证页面跳转**
   确保从"我的首页"或其他入口能正确跳转到事件报告页面。

## 文件清单

```
000事件报告备份/
├── README.md                           # 本说明文件
├── docs/
│   ├── AC-396-03R2事件信息填报和处理规范.md
│   └── 上海飞行部事件信息报告规定202507版.md
└── miniprogram/
    └── packageO/
        ├── event-report/
        │   ├── history.json
        │   ├── history.ts
        │   ├── history.wxml
        │   ├── initial-report.js
        │   ├── initial-report.json
        │   ├── initial-report.wxml
        │   ├── initial-report.wxml.backup
        │   └── initial-report.wxss
        └── data/
            └── event-types.js
```

## 注意事项

- 恢复代码后需要在微信开发者工具中重新编译
- 检查是否有其他文件引用了事件报告相关的路径
- 确保所有依赖的 utils 工具函数仍然存在
