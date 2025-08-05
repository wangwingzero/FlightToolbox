# Aviation Weather Data API 指南

## 概述

Aviation Weather Service的Data API提供机器对机器访问航空天气信息的服务。该系统允许访问过去15天的天气数据，具有各种格式和产品类型。

## 可用产品

| 产品 | 描述 | 覆盖范围 | 格式 |
| --- | --- | --- | --- |
| METAR | 终端观测数据 | 全球 | Raw METAR, JSON, GeoJSON, CSV, XML |
| TAF | 终端预报 | 全球 | Raw METAR, JSON, GeoJSON, XML |
| PIREPs | 飞行员和飞机报告 | 主要覆盖美国和北大西洋 | Raw text, JSON, GeoJSON, XML |
| SIGMETs | 航空警告 | 全球 | Raw text, JSON, GeoJSON, XML |
| G-AIRMETs | 航空建议 | 美国本土48州 | Raw text, JSON, GeoJSON, XML |
| Center Weather Advisories | 区域航空建议 | 美国 | Raw text, JSON, GeoJSON |
| Area Forecast | 航空预报 | 阿拉斯加 | Text |
| Area Forecast Discussions | 航空讨论 | 美国 | Text |
| Meteorological Impact Statements | 航空气象声明 | 美国 | Text |
| Legacy wind/temp tables | 风温预报表 | 美国 | Text |
| Station info | 气象观测站信息 | 全球 | JSON, GeoJSON, XML |
| Airport info | 机场信息 | 全球 | JSON, GeoJSON, XML |
| NAVAID, fix, feature, obstacle | 航空导航特征 | 全球 | JSON, GeoJSON, XML |

**注意**: CONUS文本AIRMETs在2025年1月停止使用，G-AIRMETs替代了AIRMETs，在时间和空间上提高了预报精度。

## API端点

### 基本URL
```
https://aviationweather.gov/api/data
```

### 示例请求
获取堪萨斯城国际机场最新METAR的JSON格式数据：
```
https://aviationweather.gov/api/data/metar?ids=KMCI&format=json
```

## 缓存文件

为了避免过大或过频繁的自定义查询，推荐使用以下缓存文件：

| 文件 | 描述 | 更新频率 |
| --- | --- | --- |
| `/data/cache/metars.cache.xml.gz` | 所有当前METARs (XML) - gzip压缩 | 每分钟 |
| `/data/cache/metars.cache.csv.gz` | 所有当前METARs (CSV) - gzip压缩 | 每分钟 |
| `/data/cache/tafs.cache.xml.gz` | 所有当前TAFs (XML) - gzip压缩 | 每10分钟 |
| `/data/cache/tafs.cache.csv.gz` | 所有当前TAFs (CSV) - gzip压缩 | 每10分钟 |
| `/data/cache/airsigmets.cache.xml.gz` | 所有当前CONUS SIGMETs (XML) - gzip压缩 | 每分钟 |
| `/data/cache/airsigmets.cache.csv.gz` | 所有当前CONUS SIGMETs (CSV) - gzip压缩 | 每分钟 |
| `/data/cache/gairmets.cache.xml.gz` | 所有当前CONUS G-AIRMETs (XML) - gzip压缩 | 每分钟 |
| `/data/cache/aircraftreports.cache.xml.gz` | 所有当前AIREPs/PIREPs (XML) - gzip压缩 | 每分钟 |
| `/data/cache/aircraftreports.cache.csv.gz` | 所有当前AIREPs/PIREPs (CSV) - gzip压缩 | 每分钟 |
| `/data/cache/stations.cache.xml.gz` | 站点列表 (XML) - gzip压缩 | 每天 |
| `/data/cache/stations.cache.json.gz` | 站点列表 (JSON) - gzip压缩 | 每天 |

## 使用指南

### 最佳实践
- 仔细考虑请求以限制系统负载
- 设置自定义用户代理以防止自动过滤意外阻止有效流量
- 在连续请求之间等待 — 最大每分钟100个请求
- 超过请求限制将导致访问被临时阻止

### 技术要求
- 使用现代HTTPS连接
- 确保网络连接稳定
- 验证防火墙或代理未阻止您的请求

## 限制条件

- 所有请求限制为每分钟100个请求
- 所有API端点每个线程不应超过每分钟1个请求的频率
- 大多数端点最多返回1,000个条目
- 目前不允许跨源资源共享(CORS)

## 错误代码

| HTTP错误代码 | 描述 |
| --- | --- |
| 400 Invalid Request | 请求无效，可能包括：无效参数（如格式或日期）、缺少完成请求所需的参数、URL不正确 |
| 404 Not Found | 端点或项目无效 |
| 429 Too Many Requests | 发送的请求过多，达到速率限制 |
| 500 Internal Server | 系统因错误无法处理请求 |
| 502 Bad Gateway<br/>504 Gateway Timeout | 临时服务中断 |

## 数据格式支持

### XML XSD模式
- aircraftreport
- airsigmet
- cwa
- gairmet
- metar
- stationinfo
- taf

### JSON格式
- airsigmet
- cwa
- gairmet
- isigmet
- pirep
- taf

## 访问声明

您正在访问美国政府信息系统。系统使用受到监管，未经授权的使用被禁止并可能面临刑事和民事处罚。政府可能出于任何合法的政府目的监控、拦截、审计和搜索该系统上的任何通信或数据。

## OpenAPI规范

完整的API规范文档以OpenAPI YAML格式提供，包含交互式界面供学习和测试。

---

*版本: v3.28*
*更新时间: 2025年*