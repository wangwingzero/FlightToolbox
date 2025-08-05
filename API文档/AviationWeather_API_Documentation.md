# AviationWeather.gov API 文档

## 概述

**版本**: 3.12  
**基础URL**: https://aviationweather.gov  
**标题**: AviationWeather.gov API  
**描述**: AviationWeather.gov的新数据API，取代了ADDS数据服务器和AviationWeather Web服务  
**服务条款**: https://aviationweather.gov/data/api/

## 标签

- **Data**: 解码的天气和导航信息
- **Dataserver**: 使用专为与之前文本数据服务器最大兼容性而设计的接口的航空天气信息

## API 端点

### 数据端点 (Data)

#### 1. METARs - 气象观测报告

**端点**: `/api/data/metar`  
**方法**: GET  
**描述**: 解码的航空天气观测报告

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `ids` | string | 否 | 机场ID(s) | `KMCI` (单个), `KMCI,KORD,KBOS` (多个), `@WA` (州代码) |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson`, `xml`, `html` |
| `taf` | boolean | 否 | 包含TAF信息 | `true`, `false` |
| `hours` | number | 否 | 向前搜索的小时数 | `24` |
| `bbox` | string | 否 | 地理边界框 (lat0,lon0,lat1,lon1) | `40,-90,45,-85` |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 2. TAFs - 机场天气预报

**端点**: `/api/data/taf`  
**方法**: GET  
**描述**: 解码的机场天气预报

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `ids` | string | 否 | 机场ID(s) | `KMCI` (单个), `KMCI,KORD,KBOS` (多个), `@WA` (州代码) |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson`, `xml`, `html` |
| `metar` | boolean | 否 | 包含METAR信息 | `true`, `false` |
| `bbox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `time` | string | 否 | 按有效时间或发布时间处理 | `valid` (默认), `issue` |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 3. PIREPs - 飞行员报告

**端点**: `/api/data/pirep`  
**方法**: GET  
**描述**: PIREP或AIREP格式的飞行员报告

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `id` | string | 否 | 机场ID | |
| `format` | string | 否 | 输出格式 (默认: raw) | `raw`, `json`, `geojson`, `xml` |
| `age` | number | 否 | 向前搜索小时数 | |
| `distance` | number | 否 | 距离 | |
| `level` | number | 否 | 搜索高度 ±3000英尺 | |
| `inten` | string | 否 | 最低强度 | `lgt`, `mod`, `sev` |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 4. 国内SIGMETs - 重要气象情报

**端点**: `/api/data/airsigmet`  
**方法**: GET  
**描述**: 美国国内SIGMET，不包括美国发布的国际格式SIGMET。国内AIRMET已停用，请参见G-AIRMET

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `format` | string | 否 | 输出格式 | `raw`, `json`, `xml` |
| `hazard` | string | 否 | 危险类型 | `conv`, `turb`, `ice`, `ifr` |
| `level` | number | 否 | 搜索高度 ±3000英尺 | |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 5. 国际SIGMETs

**端点**: `/api/data/isigmet`  
**方法**: GET  
**描述**: 解码的国际SIGMET，不包括美国国内格式的SIGMET

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `format` | string | 否 | 输出格式 | `raw`, `json`, `xml` |
| `hazard` | string | 否 | 危险类型 | `turb`, `ice` |
| `level` | number | 否 | 搜索高度 ±3000英尺 | |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 6. G-AIRMETs - 美国图形化航空器气象情报

**端点**: `/api/data/gairmet`  
**方法**: GET  
**描述**: 美国本土的解码G-AIRMET

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `type` | string | 否 | 产品类型 | `sierra`, `tango`, `zulu` |
| `format` | string | 否 | 输出格式 | `decoded`, `json`, `geojson`, `xml` |
| `hazard` | string | 否 | 危险类型 | `turb-hi`, `turb-lo`, `llws`, `sfc_wind`, `ifr`, `mtn_obs`, `ice`, `fzlvl` |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 7. CWA - 中心天气咨询

**端点**: `/api/data/cwa`  
**方法**: GET  
**描述**: 由NWS中心天气服务单位(CWSU)发布的中心天气咨询

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `hazard` | string | 否 | 危险类型 | `ts`, `turb`, `ice`, `ifr`, `pcpn`, `unk` |
| `date` | string | 否 | 日期时间 | `yyyymmdd_hhmm` 或 `yyyy-mm-ddThh:mm:ssZ` |

**响应**: 200 - 操作成功

---

#### 8. 高空风温数据

**端点**: `/api/data/windtemp`  
**方法**: GET  
**描述**: 来自传统FD风数据的风和温度信息

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `region` | string | 否 | 区域 | `us`, `bos`, `mia`, `chi`, `dfw`, `slc`, `sfo`, `alaska`, `hawaii`, `other_pac` |
| `level` | string | 否 | 高度层 | `low`, `high` |
| `fcst` | string | 否 | 预报周期 | `06`, `12`, `24` |

**响应**: 200 - 操作成功

---

#### 9. 美国区域预报

**端点**: `/api/data/areafcst`  
**方法**: GET  
**描述**: 美国本土以外地区的文本区域预报

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `region` | string | **是** | 区域 | `aknorth`, `akcentral`, `akaleutian`, `aksouth`, `aksouthwest`, `aksoutheast`, `akpanhandle` |

**响应**: 200 - 操作成功

---

#### 10. 美国预报讨论

**端点**: `/api/data/fcstdisc`  
**方法**: GET  
**描述**: 由NWS天气预报办公室发布的航空预报讨论

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|------|
| `cwa` | string | 否 | 县警告区域(WFO) | `keax` (堪萨斯城) |
| `type` | string | 否 | 输出类型 | `afd` (航空讨论), `af` (完整讨论) |

**响应**: 200 - 操作成功

---

#### 11. MIS - 气象信息声明

**端点**: `/api/data/mis`  
**方法**: GET  
**描述**: 由NWS中心天气服务单位(CWSU)发布的气象信息声明

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `loc` | string | 否 | CWSU | `zkc` (堪萨斯城) |

**响应**: 200 - 操作成功

---

#### 12. 气象站信息

**端点**: `/api/data/stationinfo`  
**方法**: GET  
**描述**: 气象站观测位置信息

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `ids` | string | 否 | 气象站ID(s) | `KORD,KJFK,KDEN` |
| `bbox` | string | 否 | 地理边界框 | `35,-90,45,-80` |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson`, `xml` |

**响应**: 200 - 操作成功

---

#### 13. 机场信息

**端点**: `/api/data/airport`  
**方法**: GET  
**描述**: 机场相关信息

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `ids` | string | 否 | 机场ID(s) | `KMCI` (单个), `KMCI,KORD,KBOS` (多个), `@WA` (州代码) |
| `bbox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `format` | string | 否 | 输出格式 | `decoded`, `json`, `geojson` |

**响应**: 200 - 操作成功

---

#### 14. 导航设备信息

**端点**: `/api/data/navaid`  
**方法**: GET  
**描述**: 导航设备数据

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `ids` | string | 否 | 5位定位点ID(s) | `MCI` |
| `bbox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson` |

**响应**: 200 - 操作成功

---

#### 15. 导航定位点信息

**端点**: `/api/data/fix`  
**方法**: GET  
**描述**: 导航定位点数据

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `ids` | string | 否 | 5位定位点ID(s) | `BARBQ` |
| `bbox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson` |

**响应**: 200 - 操作成功

---

#### 16. 地理特征信息

**端点**: `/api/data/feature`  
**方法**: GET  
**描述**: 额外的地理特征

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `bbox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson` |

**响应**: 200 - 操作成功

---

#### 17. 障碍物信息

**端点**: `/api/data/obstacle`  
**方法**: GET  
**描述**: 航空障碍物信息

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `bbox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `format` | string | 否 | 输出格式 | `raw`, `json`, `geojson` |

**响应**: 200 - 操作成功

---

### 数据服务器端点 (Dataserver)

数据服务器端点提供与之前文本数据服务器最大兼容性的接口。

#### 1. 数据服务器 METARs

**端点**: `/api/data/dataserver?requestType=retrieve&dataSource=metars`  
**方法**: GET  
**描述**: METAR报告

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `stationString` | string | 否 | 气象站ID (必须指定stationString或边界框) | `KMCI` (单个), `KMCI,KORD,KBOS` (多个), `@WA` (州代码) |
| `startTime` | string | 否 | 开始时间 | Unix时间戳或ISO8601格式 |
| `endTime` | string | 否 | 结束时间 | Unix时间戳或ISO8601格式 |
| `hoursBeforeNow` | number | 否 | 向前搜索小时数 | |
| `format` | string | 否 | 输出格式 (默认: xml) | `xml`, `csv` |
| `mostRecent` | boolean | 否 | 最新的单个METAR | |
| `mostRecentForEachStation` | string | 否 | 每个站点的最新METAR | `constraint`, `postfilter` |
| `boundingBox` | string | 否 | 地理边界框 | `40,-90,45,-85` |

**响应**: 200 - 操作成功

---

#### 2. 数据服务器 TAFs

**端点**: `/api/data/dataserver?requestType=retrieve&dataSource=tafs`  
**方法**: GET  
**描述**: TAF数据

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `stationString` | string | 否 | 气象站ID (必须指定stationString或边界框) | `KMCI` (单个), `KMCI,KORD,KBOS` (多个), `@WA` (州代码) |
| `startTime` | string | 否 | 开始时间 | Unix时间戳或ISO8601格式 |
| `endTime` | string | 否 | 结束时间 | Unix时间戳或ISO8601格式 |
| `hoursBeforeNow` | number | 否 | 向前搜索小时数 | |
| `format` | string | 否 | 输出格式 (默认: xml) | `xml`, `csv` |
| `mostRecent` | boolean | 否 | 最新的单个TAF | |
| `mostRecentForEachStation` | string | 否 | 每个站点的最新TAF | `constraint`, `postfilter` |
| `boundingBox` | string | 否 | 地理边界框 | `40,-90,45,-85` |

**响应**: 200 - 操作成功

---

#### 3. 数据服务器 AIREPs和PIREPs

**端点**: `/api/data/dataserver?requestType=retrieve&dataSource=aircraftreports`  
**方法**: GET  
**描述**: 飞机数据报告

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `startTime` | string | 否 | 开始时间 | Unix时间戳或ISO8601格式 |
| `endTime` | string | 否 | 结束时间 | Unix时间戳或ISO8601格式 |
| `hoursBeforeNow` | number | 否 | 向前搜索小时数 | |
| `format` | string | 否 | 输出格式 (默认: xml) | `xml`, `csv` |
| `boundingBox` | string | 否 | 地理边界框 | `40,-90,45,-85` |
| `radialDistance` | string | 否 | 由经纬度和法定英里半径距离定义的圆形边界 | `20;-105,39` |

**响应**: 200 - 操作成功

---

#### 4. 数据服务器 SIGMETs

**端点**: `/api/data/dataserver?requestType=retrieve&dataSource=airsigmets`  
**方法**: GET  
**描述**: SIGMET数据

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `startTime` | string | 否 | 开始时间 | Unix时间戳或ISO8601格式 |
| `endTime` | string | 否 | 结束时间 | Unix时间戳或ISO8601格式 |
| `hoursBeforeNow` | number | 否 | 向前搜索小时数 | |
| `format` | string | 否 | 输出格式 (默认: xml) | `xml`, `csv` |
| `boundingBox` | string | 否 | 地理边界框 | `40,-90,45,-85` |

**响应**: 200 - 操作成功

---

#### 5. 数据服务器 G-AIRMETs

**端点**: `/api/data/dataserver?requestType=retrieve&dataSource=gairmets`  
**方法**: GET  
**描述**: G-AIRMET数据

**查询参数**:

| 参数 | 类型 | 必需 | 描述 | 示例 |
|------|------|------|------|------|
| `startTime` | string | 否 | 开始时间 | Unix时间戳或ISO8601格式 |
| `endTime` | string | 否 | 结束时间 | Unix时间戳或ISO8601格式 |
| `hoursBeforeNow` | number | 否 | 向前搜索小时数 | |
| `format` | string | 否 | 输出格式 (默认: xml) | `xml`, `csv` |
| `boundingBox` | string | 否 | 地理边界框 | `40,-90,45,-85` |

**响应**: 200 - 操作成功

---

## 使用说明

### 日期时间格式

API支持以下日期时间格式：
- `yyyymmdd_hhmm` - 示例: `20231220_000000Z`
- `yyyy-mm-ddThh:mm:ssZ` - ISO8601格式，示例: `2023-12-20T00:00:00Z`
- Unix时间戳 (仅数据服务器端点) - 示例: `1703052000`

### 地理边界框格式

地理边界框使用以下格式：`lat0,lon0,lat1,lon1`  
示例: `40,-90,45,-85` (芝加哥周围的小区域)

### 机场ID格式

- 单个ICAO ID: `KMCI`
- 多个ICAO ID: `KMCI,KORD,KBOS` (逗号或空格分隔)
- 州代码: `@WA` (以@开头的2位州代码)

### 区域代码

风温数据区域：
- `us` - 全部站点
- `bos` - 东北部
- `mia` - 东南部
- `chi` - 中北部
- `dfw` - 中南部
- `slc` - 洛基山脉
- `sfo` - 太平洋海岸
- `alaska` - 阿拉斯加
- `hawaii` - 夏威夷
- `other_pac` - 西太平洋

### 响应格式

大多数端点支持以下输出格式：
- `raw` - 原始文本格式
- `json` - JSON格式
- `geojson` - GeoJSON格式
- `xml` - XML格式
- `html` - HTML格式
- `csv` - CSV格式 (仅数据服务器端点)

## 注意事项

1. 这个API取代了ADDS数据服务器和AviationWeather Web服务
2. 数据服务器端点设计为与之前的文本数据服务器最大兼容
3. 国内AIRMET已停用，请使用G-AIRMET
4. 所有时间均为UTC
5. 地理坐标使用十进制度数格式

## 联系信息

- 服务条款: https://aviationweather.gov/data/api/
- API版本: 3.12

---

*此文档基于AviationWeather.gov API的OpenAPI 3.0.0规范生成*