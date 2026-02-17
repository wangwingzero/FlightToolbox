# Cloudflare R2 音频与大文件存储迁移运维手册

## 1. 目标与适用范围

本文用于指导 `FlightToolbox` 项目将大量音频/附件从代码包或 Git 仓库迁移到 `Cloudflare R2`，并通过腾讯轻量服务器做导入与运维。

适用对象：
- 人工开发者
- 后续接手的 AI 代码助手

---

## 2. 给 AI 的快速执行清单（先看这个）

1. 先确认当前资源路径模式：
   - 本地分包路径模式：`/packageJapan/xxx.mp3`
   - 远程 URL 模式：`https://media.example.com/packageJapan/xxx.mp3`
2. 若仅新增/替换文件，不改播放架构：
   - 上传资源到 R2
   - 保持现有本地分包逻辑不动
3. 若要“全量音频改为远程 R2”：
   - 必须同步改造 `audio-config.js` + `audio-cache-manager.js` + `offline-audio-manager.js`
4. 小程序后台必须配置域名白名单：
   - `request` 合法域名
   - `downloadFile` 合法域名
5. 发布前必须做真机验证：
   - 2G/4G/Wi-Fi 三种网络至少各测 1 次
   - 开启/关闭调试模式各测 1 次

---

## 3. 当前代码基线（必须理解）

当前音频链路是“本地分包优先”，不是远程 URL 优先：

- `miniprogram/utils/audio-config.js`
  - `audioPath` 当前是本地分包路径（例如 `/packageJapan/`）。
- `miniprogram/utils/audio-data-provider.js`
  - `originalAudioSrc = audioPath + mp3_file`。
- `miniprogram/utils/audio-cache-manager.js`
  - 当前用 `FileSystemManager.copyFile` 从分包路径复制到本地缓存。
- `miniprogram/utils/offline-audio-manager.js`
  - 会先加载分包，再调用缓存逻辑。

结论：
- 如果把 `audioPath` 直接改成 `https://...`，现有 `copyFile` 流程会失败。
- 全量远程化必须改缓存策略为 `wx.downloadFile`。

---

## 4. 推荐架构（成本与稳定性最优）

推荐使用：

- 存储层：`Cloudflare R2`
- 分发层：`Cloudflare 自定义域名（HTTPS）`
- 控制层：`腾讯轻量服务器（仅导入/脚本/管理）`
- 客户端：小程序直接请求 CDN 域名

关键原则：
- 不让用户下载流量经过腾讯服务器（否则轻量流量容易超额）。
- 腾讯服务器只负责“导入+管理”，不做代理下载。

---

## 5. 实施步骤

### 5.1 Cloudflare 侧

1. 创建 R2 Bucket（例如：`flighttoolbox-media`）。
2. 创建 API Token（仅最小权限）：
   - `Object Read/Write` 到目标 Bucket。
3. 绑定自定义域名（示例：`media.example.com`）。
4. 确认 HTTPS 可访问。

说明：
- 生产环境不要依赖 `r2.dev`。

### 5.2 腾讯轻量服务器侧（导入机）

建议 Ubuntu，安装 `rclone`：

```bash
curl https://rclone.org/install.sh | sudo bash
rclone version
```

创建配置：

```bash
rclone config
```

建议参数：
- `Storage` 选 `s3`
- `provider` 选 `Cloudflare`
- `access_key_id` / `secret_access_key` 填 R2 凭证
- `endpoint` 用账户级 R2 endpoint（形如 `https://<accountid>.r2.cloudflarestorage.com`）

### 5.3 导入命令（服务器执行）

先试跑（不落盘）：

```bash
rclone sync /data/flighttoolbox-audio r2:flighttoolbox-media/audio --dry-run --progress
```

正式同步：

```bash
rclone sync /data/flighttoolbox-audio r2:flighttoolbox-media/audio --progress --transfers 8 --checkers 16
```

增量更新（常用）：

```bash
rclone copy /data/flighttoolbox-audio r2:flighttoolbox-media/audio --progress --transfers 8 --checkers 16
```

生成文件清单（便于回溯）：

```bash
rclone lsjson r2:flighttoolbox-media/audio --recursive > audio-manifest.json
```

### 5.4 小程序后台配置（必须）

`mp.weixin.qq.com -> 开发 -> 开发管理 -> 开发设置 -> 服务器域名`

新增：
- `request` 合法域名：`https://media.example.com`
- `downloadFile` 合法域名：`https://media.example.com`

如果同时保留局方规章直连，还需：
- `https://www.caac.gov.cn`

---

## 6. 两种迁移策略

## 6.1 策略 A（推荐先做）：仅把“大文件/新增文件”上 R2

特点：
- 音频主链路继续走本地分包
- 现有播放器和缓存代码几乎不用动
- 风险最低，发布最快

适合：
- 先降包体压力
- 先验证 CDN 与域名配置

## 6.2 策略 B：全量音频改远程 R2

必须改造：

1. `miniprogram/utils/audio-config.js`
   - `audioPath` 从 `/packageX/` 切换为远程前缀（建议通过统一配置注入，不要硬编码散落）。
2. `miniprogram/utils/audio-cache-manager.js`
   - 当前 `copyFile` 分包复制逻辑改为 `wx.downloadFile` + 本地持久化。
3. `miniprogram/utils/offline-audio-manager.js`
   - 离线下载逻辑从“分包加载 + copy”改为“远程下载 + 缓存”。
4. 真机重测：
   - 首次播放、缓存命中、断网播放、缓存清理回收。

不建议一步切到策略 B，建议先策略 A 再灰度。

---

## 7. 流量与费用控制（你关心的“会不会超量”）

是否超量取决于是否让用户流量经过腾讯轻量服务器：

- 不经过（推荐）：
  - 轻量服务器主要消耗导入时流量，通常可控。
- 经过（不推荐）：
  - 用户每次下载都算轻量出流量，容易超额。

估算公式：

```text
当月轻量出流量 = 导入流量 + 用户经服务器转发流量
超额费用 = max(0, 当月出流量 - 套餐流量) * 超额单价(元/GB)
```

控制措施：
- 禁止下载代理模式（客户端直连 R2 域名）。
- 大批量导入安排在月初并做流量看板告警。
- 上传命令优先用 `sync/copy` 增量，避免重复全量。

---

## 8. 标准发布流程（SOP）

1. 在测试 Bucket 上传并校验可访问性。
2. 小程序开发版接入测试域名，真机验证通过后再切生产域名。
3. 发布前确认小程序后台域名已生效。
4. 发布后观察 24 小时：
   - 下载成功率
   - 播放失败率
   - 服务器出流量
5. 出现异常可回滚：
   - 恢复 `audioPath` 为本地分包路径
   - 关闭远程入口开关

---

## 9. 后续 AI 修改时的“禁止事项”

- 不要把 R2 Access Key 写入仓库。
- 不要把用户下载流量强制经过腾讯服务器代理。
- 不要直接把 `audioPath` 改成远程 URL 却不改缓存逻辑。
- 不要只在开发者工具“关闭域名校验”场景下验证。

---

## 10. 后续 AI 修改时的“完成定义”（DoD）

满足以下条件才算完成：

1. 文档中有本次改动说明（路径、配置、回滚方式）。
2. 真机验证记录完整（至少 Wi-Fi + 蜂窝网络）。
3. 小程序后台域名配置已确认。
4. 未引入明文密钥。
5. 音频/文件下载失败时有明确降级提示。

