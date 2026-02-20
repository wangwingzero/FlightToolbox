# CCAR 法规数据管线架构文档

> 本文档面向 AI 助手和开发者，描述 CAAC 法规数据从局方网站到用户手机的完整链路。

## 一、系统总览

```
CAAC 官网 (caac.gov.cn)
    │
    ▼
GitHub Actions (每日定时)          本地脚本 (手动)
    │ CCAR-workflow 仓库               │ 虎哥CAAC规章收集器.pyw
    │                                  │
    ├─→ 抓取文档元数据                  ├─→ 抓取文档元数据
    ├─→ 下载 PDF 附件                  └─→ 输出 JS 到 D:\法规文件\CAAC_数据\
    ├─→ 上传 PDF 到 R2 桶                   │
    ├─→ 生成 JS + JSON                     ▼
    ├─→ 上传 JSON 到 R2 桶            sync_ccar_to_miniprogram.py
    └─→ 同步 JS 到 FlightToolbox 仓库      │ 复制+重命名到小程序目录
                                           ▼
                              miniprogram/packageCCAR/
                              ├── regulation.js    (CCAR规章)
                              ├── normative.js     (规范性文件)
                              └── specification.js (标准规范)
```

## 二、涉及的仓库和目录

| 位置 | 作用 |
|------|------|
| `D:\CCAR-workflow\` | 自动化抓取+上传工作流（Python，GitHub Actions） |
| `D:\FlightToolbox\` | 微信小程序主仓库 |
| `D:\FlightToolbox\miniprogram\packageCCAR\` | 小程序中的法规分包 |
| `D:\法规文件\CAAC_数据\` | 本地脚本抓取的输出目录（按日期子目录） |
| Cloudflare R2 桶 `ccar.hudawang.cn` | PDF 和 JSON 数据的 CDN 存储 |

## 三、数据格式

### 3.1 JS 数据文件格式（打包在小程序中）

三个文件共用相同结构，区别在于导出名：

```javascript
// regulation.js → regulationData
// normative.js  → normativeData
// specification.js → standardData

var data = [
  {
    "title": "大型飞机公共航空运输承运人运行合格审定规则",
    "url": "http://www.caac.gov.cn/XXGK/XXGK/MHGZ/...",
    "doc_type": "CCAR规章",
    "validity": "有效",           // "有效" | "失效" | "废止"
    "doc_number": "CCAR-121-R8",
    "office_unit": "政策法规司",
    "pdf_url": "https://ccar.hudawang.cn/regulation/CCAR-121-R8大型飞机....pdf",
    // normative/specification 还有：
    "sign_date": "2026年01月27日",
    "publish_date": "2026年01月27日",
    "file_number": "民航规〔2026〕3号"
  },
  // ...
];

module.exports = { regulationData: data };
```

### 3.2 JSON 数据文件格式（R2 热更新用）

与 JS 中 `data` 数组完全相同，纯 JSON 数组，无 `var` / `module.exports` 包装：

```
https://ccar.hudawang.cn/data/v1/regulation.json
https://ccar.hudawang.cn/data/v1/normative.json
https://ccar.hudawang.cn/data/v1/specification.json
```

### 3.3 分类 ID 映射

| 分类 ID | 名称 | JS 文件名 | JS 导出名 | R2 子目录 |
|---------|------|-----------|-----------|-----------|
| 13 | 民航规章 | regulation.js | regulationData | regulation/ |
| 14 | 规范性文件 | normative.js | normativeData | normative/ |
| 15 | 标准规范 | specification.js | standardData | specification/ |

## 四、R2 存储桶结构

域名：`https://ccar.hudawang.cn`

```
ccar.hudawang.cn/
├── data/v1/                    ← 法规元数据 JSON（小程序热更新）
│   ├── regulation.json
│   ├── normative.json
│   └── specification.json
├── regulation/                 ← 规章 PDF 文件
│   ├── CCAR-121-R8大型飞机....pdf
│   └── ...
├── normative/                  ← 规范性文件 PDF
│   └── ...
├── specification/              ← 标准规范 PDF
│   └── ...
├── walkaround/v1/              ← 绕机检查图片（与本文档无关）
└── audio/v1/                   ← 航线录音（与本文档无关）
```

### PDF 文件命名规则

```
{validity!}{doc_number}{title}.pdf
```

- 有效文档不加前缀：`CCAR-121-R8大型飞机公共航空运输承运人运行合格审定规则.pdf`
- 失效文档加前缀：`失效!CCAR-121-R7大型飞机....pdf`
- 非法字符替换为 `_`，文件名上限 200 字符

此命名规则在两处实现，**必须保持一致**：
- `CCAR-workflow/src/crawler.py` → `generate_filename()`
- `FlightToolbox/miniprogram/packageCCAR/utils.js` → `generateOfficialFileName()`

## 五、小程序数据加载策略

文件：`miniprogram/packageCCAR/data-loader.js`

采用 **stale-while-revalidate** 模式，三级数据源：

```
优先级 1：R2 缓存（wx.getStorageSync 中上次拉取的 JSON）
    ↓ 缓存为空时
优先级 2：打包的本地 JS 数据（跟随小程序版本发布）
    ↓ 始终在后台执行
后台刷新：静默请求 R2 JSON，更新本地缓存，下次打开生效
```

- 缓存 key 通过 `VersionManager.getCacheKey()` 生成，小程序升版后自动失效旧缓存
- 飞行模式下网络请求静默失败，不影响离线使用
- `r2-config.js` 中 `useR2ForData: true` 控制开关

## 六、PDF 下载优先级

文件：`miniprogram/packageCCAR/utils.js` → `resolveOfficialDownloadUrl()`

```
优先级 1：局方官网直接下载（caac.gov.cn）
    请求详情页 HTML → 正则提取附件链接 → 下载 PDF
    ↓ 局方没附件 或 网络不通
优先级 2：R2 镜像（ccar.hudawang.cn）
    使用数据中的 pdf_url / download_url 字段
    ↓ R2 也没有
优先级 3：复制链接兜底
    弹窗提示用户复制局方页面链接到浏览器打开
```

小程序后台需配置的 request 合法域名：
- `ccar.hudawang.cn` — R2 数据 + PDF 镜像
- `www.caac.gov.cn` — 局方官网直接下载

## 七、GitHub Actions 自动更新

文件：`CCAR-workflow/.github/workflows/check-updates.yml`

### 定时触发

- Cron: `0 7 * * *`（UTC 7:00 = 北京时间 15:00，每天一次）
- 默认抓取全部 29 个分类，每分类 200 条

### 手动触发参数

| 参数 | 说明 | 示例 |
|------|------|------|
| categories | 抓取的分类 ID（逗号分隔） | `13,14,15` |
| days | 文档时间范围（天数） | `30`、`9999`（全量） |
| notify | 是否发通知 | `0`=仅新文档时、`1`=强制发 |

### 工作流步骤

```
1. 抓取 CAAC 网站（Patchright 反检测浏览器）
2. 检测新增/变更文档（与 data/regulations.json 比对）
3. 下载 PDF 附件到 downloads/
4. 上传 PDF 到 R2 桶
5. 生成 JS + JSON 文件到 JS/
5b. 上传 JSON 到 R2 桶 (data/v1/*.json)
6. 发送通知（邮件/PushPlus/Telegram）
7. 提交状态文件到 CCAR-workflow 仓库
8. 同步 JS 文件到 FlightToolbox 仓库
```

注意：`downloads/` 目录**不再提交到 GitHub 仓库**，PDF 仅存储在 R2。

### 环境变量 / Secrets

| 变量 | 用途 |
|------|------|
| R2_WORKER_URL | Cloudflare Worker 上传代理地址 |
| R2_WORKER_SECRET | Worker 认证 token |
| R2_DOMAIN | R2 自定义域名（`ccar.hudawang.cn`） |
| FLIGHTTOOLBOX_TOKEN | 跨仓库推送 JS 到 FlightToolbox 用的 PAT |
| EMAIL_USER / EMAIL_PASS | QQ 邮箱通知 |
| PUSHPLUS_TOKEN | PushPlus 通知 |
| TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID | Telegram 通知 |

## 八、本地手动更新流程

当需要用本地抓取脚本更新小程序数据时：

```bash
# 1. 运行本地抓取脚本（产出到 D:\法规文件\CAAC_数据\YYYYMMDD\）
# 2. 同步到小程序目录
python sync_ccar_to_miniprogram.py

# 或指定源目录
python sync_ccar_to_miniprogram.py D:/法规文件/CAAC_数据/20260212

# 先预览不实际复制
python sync_ccar_to_miniprogram.py --dry-run
```

脚本自动匹配文件名前缀并重命名：
- `CCAR规章_*.js` → `regulation.js`
- `规范性文件_*.js` → `normative.js`
- `标准规范_*.js` → `specification.js`

## 九、关键文件索引

### FlightToolbox 仓库

| 文件 | 作用 |
|------|------|
| `miniprogram/packageCCAR/data-loader.js` | 三级数据加载器（R2缓存 → 打包JS → 空数组） |
| `miniprogram/packageCCAR/utils.js` | PDF 下载逻辑、附件提取、文件命名 |
| `miniprogram/packageCCAR/config.js` | 分包常量配置 |
| `miniprogram/packageCCAR/regulation.js` | 规章数据（自动生成，可手动替换） |
| `miniprogram/packageCCAR/normative.js` | 规范性文件数据 |
| `miniprogram/packageCCAR/specification.js` | 标准规范数据 |
| `miniprogram/utils/r2-config.js` | R2 域名、版本号、URL 构建 |
| `sync_ccar_to_miniprogram.py` | 本地数据同步助手 |

### CCAR-workflow 仓库

| 文件 | 作用 |
|------|------|
| `src/crawler.py` | CAAC 网站抓取、PDF 下载、附件提取 |
| `src/storage.py` | 状态管理、变更检测、JS/JSON 生成 |
| `src/r2_uploader.py` | Cloudflare R2 上传（Worker 代理） |
| `src/main.py` | 主流程编排 |
| `src/notifier.py` | 多渠道通知（邮件/PushPlus/Telegram） |
| `data/regulations.json` | 文档状态持久化 |
| `data/downloads.json` | 下载文件索引 |
| `data/r2_uploads.json` | R2 上传缓存（文件大小校验，避免重复上传） |
| `.github/workflows/check-updates.yml` | GitHub Actions 工作流 |

## 十、ES5 约束

小程序所有 `.js` 文件**必须使用 ES5 语法**：
- `var` 而非 `let`/`const`
- `function(){}` 而非箭头函数
- 字符串拼接而非模板字符串
- `Promise.then()` 而非 `async/await`
- 不使用解构赋值、class、扩展运算符

CCAR-workflow 仓库（Python）无此限制。
