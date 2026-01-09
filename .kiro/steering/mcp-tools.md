---
inclusion: always
---

# MCP 工具使用指南

本项目是微信小程序（飞行工具箱），主动使用 MCP 工具提供更高效的开发支持。

## Context7 - 编程文档查询

**触发场景**：
- 微信小程序 API 用法（wx.* 接口、组件生命周期、页面配置）
- Vant Weapp 组件用法和属性
- JavaScript/TypeScript 语法和 API
- 小程序框架相关问题

**使用流程**：
1. `mcp_context7_resolve_library_id` 获取库 ID（如 wechat-miniprogram、vant-weapp）
2. `mcp_context7_query_docs` 查询具体问题

**典型场景**：
- 查询 `wx.getLocation` 参数和返回值
- Vant 组件如 `van-dialog`、`van-toast` 的配置
- 小程序分包加载、预加载规则

## Exa - 智能搜索

**触发场景**：
- `mcp_exa_web_search_exa` - 微信小程序最新政策、审核规则变化、新功能发布
- `mcp_exa_get_code_context_exa` - 小程序代码示例、最佳实践、性能优化方案

**典型场景**：
- 小程序广告组件接入方案
- 离线存储最佳实践
- 音频播放兼容性问题

## Everything Search - Windows 文件搜索

**触发场景**：
- 在项目或本地磁盘快速查找文件
- 按类型/大小/日期筛选文件
- 查找分散在多个分包中的相关文件

**工具**：`mcp_everything_search_search`

**典型场景**：
- 查找所有 `*-manager.js` 工具类
- 定位特定分包中的页面文件
- 查找包含特定关键词的配置文件

## PDF Reader - PDF 读取

**触发场景**：
- 读取航空法规 PDF 原文
- 提取 CCAR 规章内容
- 解析飞行手册、操作规范等文档

**工具**：`mcp_pdf_reader_read_pdf`

**典型场景**：
- 提取 CCAR 规章条款用于数据录入
- 读取飞机性能手册数据
- 解析危险品操作指南

## Pandoc - 文档转换

**触发场景**：
- Markdown/HTML/DOCX/PDF 格式互转
- 将航空文档转换为小程序可用格式
- 生成用户手册或更新说明

**工具**：`mcp_Pandoc_convert_contents`

## Playwright - 浏览器自动化

**触发场景**：
- 从航空网站抓取数据（机场信息、天气等）
- 测试小程序 H5 版本功能
- 自动化数据采集

**常用工具**：`mcp_mcp_playwright_browser_navigate`, `mcp_mcp_playwright_browser_snapshot`, `mcp_mcp_playwright_browser_click`

## Fetch - 网页抓取

**触发场景**：
- 获取微信官方文档内容
- 抓取航空数据源
- 获取 API 接口文档

**工具**：`mcp_fetch_fetch`

## Time - 时间工具

**触发场景**：
- UTC/本地时间转换（飞行时间计算）
- 跨时区时间处理
- 值勤时间计算相关

**工具**：`mcp_time_get_current_time`, `mcp_time_convert_time`

---

## 强制规则（必须遵守）

1. **MCP 优先原则**：任务符合 MCP 工具适用场景时，**必须优先使用 MCP**
2. **文档查询必用 Context7**：涉及微信小程序 API、Vant Weapp 组件、JavaScript API 时，**必须先用 Context7 查询官方文档**
3. **代码示例必用 Exa**：需要查找小程序代码示例、最新实践时，**必须用 Exa 搜索**
4. **文件搜索必用 Everything**：在本地磁盘查找文件时，**必须用 Everything Search**，禁止用 shell 命令遍历
5. **网页内容必用 Fetch/Playwright**：获取 URL 内容时，**必须用 Fetch 或 Playwright**
6. **PDF 文档必用 PDF Reader**：需要读取 PDF 内容时，**必须用 mcp_pdf_reader_read_pdf**

## 使用原则

1. 遇到相关场景时**立即使用**对应 MCP，不要犹豫或等用户明确要求
2. 优先使用专用工具而非通用方法
3. 可以组合多个 MCP 完成复杂任务
4. 不确定小程序 API 用法时，**先用 Context7 查文档再写代码**
