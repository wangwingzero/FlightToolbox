# Cloudflare R2 国内加速 1 天落地清单（微信小程序）

更新时间：2026-02-18  
适用项目：`FlightToolbox`

## 1. 目标

在不改动现有业务逻辑的前提下，优先提升中国大陆用户的下载稳定性与速度，重点覆盖：

- 航线音频下载
- 法规数据下载
- 绕机图片下载

## 2. 当前基线（已在仓库中确认）

- R2 基础域名已使用自定义域名：`https://ccar.hudawang.cn`
- 三类资源均已启用 R2 开关：
  - `miniprogram/utils/r2-config.js:18`
  - `miniprogram/utils/r2-config.js:19`
  - `miniprogram/utils/r2-config.js:20`
- 音频远程下载与本地缓存兼容逻辑已具备：
  - `miniprogram/utils/audio-data-provider.js:81`
  - `miniprogram/utils/audio-cache-manager.js:215`
- CCAR 数据采用“本地兜底 + R2 后台刷新”：
  - `miniprogram/packageCCAR/data-loader.js:4`

结论：当前不需要重做 R2 接入，重点是分发链路优化与可观测性补齐。

## 3. 1 天执行节奏

## 3.1 上午（2-3 小时）：先做零代码改动

1. Cloudflare 缓存规则（必须）
- 目标域名：`ccar.hudawang.cn`
- 规则建议：
  - `/audio/*`：`Edge Cache TTL = 30d`，`Browser TTL = 1d`
  - `/walkaround/*`：`Edge Cache TTL = 30d`，`Browser TTL = 1d`
  - `/data/*`：`Edge Cache TTL = 10m~1h`（法规数据更新更频繁）
- 要点：
  - 保留 `Accept-Ranges: bytes`
  - 不要把所有动态请求都 `Cache Everything`

2. 微信后台域名白名单复核（必须）
- 小程序后台 `request` 合法域名：
  - `https://ccar.hudawang.cn`
- 小程序后台 `downloadFile` 合法域名：
  - `https://ccar.hudawang.cn`

3. 快速验收（必须）
- 抽查音频 URL 响应头：
  - `Content-Type` 应为 `audio/mpeg`
  - `Accept-Ranges` 应为 `bytes`
  - `cf-cache-status` 首次可能 `MISS`，再次访问应逐步出现 `HIT`

## 3.2 下午（3-4 小时）：国内 CDN 套层（效果最大）

前提：加速域名已完成 ICP 备案。

1. 新增国内 CDN 加速域名（建议）
- 例：`cdn-ccar.hudawang.cn`
- 源站地址：`ccar.hudawang.cn`
- 回源 Host：`ccar.hudawang.cn`（关键）
- 回源协议：HTTPS

2. 国内 CDN 功能开关（建议）
- 开启 `HTTP/3`
- 开启压缩（gzip/br）
- 开启 Range 请求透传
- 对静态资源配置缓存：
  - `/audio/*`、`/walkaround/*` 缓存 30 天
  - `/data/*` 缓存 10 分钟到 1 小时

3. 小程序切换（建议灰度）
- 将 `miniprogram/utils/r2-config.js:10` 的 `R2_BASE_URL` 灰度切换为 `https://cdn-ccar.hudawang.cn`
- 先在开发版/体验版验证，再全量发布

## 4. 验收指标（当天必须产出）

至少记录以下指标的“切换前 vs 切换后”：

1. 下载时延
- 指标：音频与法规文件的 `P95` 下载耗时
- 目标：较基线下降 30% 以上，或稳定性明显提升

2. 首包时间
- 指标：`TTFB`（可通过抓包或日志记录）
- 目标：主要省份明显降低并且波动收敛

3. 缓存命中
- 指标：`cf-cache-status` / 国内 CDN 命中率
- 目标：热门资源命中率持续升高

4. 播放/下载失败率
- 指标：`wx.downloadFile fail`、音频播放失败事件
- 目标：失败率下降，弱网场景改善

## 5. 回滚方案（5 分钟可执行）

1. 将 `miniprogram/utils/r2-config.js:10` 改回 `https://ccar.hudawang.cn`
2. 保持现有缓存逻辑不变（无需回滚代码架构）
3. 国内 CDN 保留配置但停止流量切换

## 6. 常见坑位检查单

1. 回源 Host 配错
- 现象：403/404 或随机失败
- 处理：回源 Host 必须是 `ccar.hudawang.cn`

2. Range 未透传
- 现象：音频拖动异常、部分机型播放失败
- 处理：确保响应头保留 `Accept-Ranges: bytes`

3. 白名单遗漏
- 现象：真机请求失败、开发工具正常
- 处理：同时检查 `request` 与 `downloadFile` 域名配置

4. 缓存策略过激
- 现象：法规数据更新后用户长期看到旧数据
- 处理：`/data/*` 缩短 TTL，音频/图片使用长 TTL

## 7. 最小执行顺序（给运维/开发直接照做）

1. 先配 Cloudflare 缓存规则并验证头部
2. 再配微信后台域名白名单
3. 最后接国内 CDN 并灰度切域名
4. 记录指标并决定是否全量

