# Requirements Document

## Introduction

本需求文档描述了 FlightToolbox 小程序广告系统的优化方案。目标是暂停所有原生模板广告（横幅广告），仅保留插屏广告和激励视频广告，同时优化插屏广告的展示策略，使其在所有 TabBar 页面展示但大幅降低展示频率，以最大化用户体验。

## Glossary

- **Ad_System**: 广告管理系统，负责管理所有广告类型的展示逻辑
- **Interstitial_Ad**: 插屏广告，全屏展示的广告形式
- **Rewarded_Video_Ad**: 激励视频广告，用户主动观看后获得奖励的广告形式
- **Native_Template_Ad**: 原生模板广告，包括横幅广告、竖版广告、全屏模板广告
- **TabBar_Page**: 底部导航栏页面，共5个：资料查询、计算工具、驾驶舱、通信、我的首页
- **Ad_Strategy**: 广告展示策略，控制广告展示的频率和时机
- **isAdFree**: 无广告状态标识，用于控制广告是否显示

## Requirements

### Requirement 1: 暂停原生模板广告

**User Story:** 作为用户，我希望减少页面中的广告干扰，以获得更流畅的使用体验。

#### Acceptance Criteria

1. WHEN 用户访问任何页面 THEN Ad_System SHALL 不展示任何原生模板广告（横幅广告、竖版广告、全屏模板广告）
2. WHEN 原生模板广告代码存在于页面中 THEN Ad_System SHALL 通过条件渲染使其不显示
3. THE Ad_System SHALL 保留原生模板广告的代码结构，以便未来恢复使用
4. THE Ad_System SHALL 通过全局配置开关控制原生模板广告的显示状态

### Requirement 2: 保留并优化插屏广告

**User Story:** 作为用户，我希望插屏广告的展示频率更低，以减少对我使用体验的干扰。

#### Acceptance Criteria

1. THE Interstitial_Ad SHALL 仅在5个 TabBar_Page 展示
2. WHEN 用户切换 TabBar_Page THEN Ad_Strategy SHALL 判断是否满足展示条件
3. THE Ad_Strategy SHALL 设置最小时间间隔为5分钟（300秒）
4. THE Ad_Strategy SHALL 设置最少操作次数为5次 TabBar 切换
5. THE Ad_Strategy SHALL 设置每30分钟会话最多展示5次
6. THE Ad_Strategy SHALL 设置每日最多展示50次
7. THE Ad_Strategy SHALL 设置新用户保护期为前20次操作不展示广告
8. WHEN 用户获得激励视频奖励 THEN Ad_Strategy SHALL 在奖励有效期内不展示插屏广告

### Requirement 3: 保留激励视频广告

**User Story:** 作为用户，我希望通过观看激励视频广告获得无广告体验的奖励。

#### Acceptance Criteria

1. THE Rewarded_Video_Ad SHALL 保持现有功能不变
2. WHEN 用户完整观看激励视频广告 THEN Ad_System SHALL 授予用户无广告奖励
3. THE Ad_System SHALL 在激励视频广告按钮上显示正确的加载状态
4. IF 激励视频广告加载失败 THEN Ad_System SHALL 隐藏观看广告按钮

### Requirement 4: 全局广告配置管理

**User Story:** 作为开发者，我希望通过统一的配置文件管理所有广告类型的开关状态。

#### Acceptance Criteria

1. THE Ad_System SHALL 在 app-config.js 中提供原生模板广告的全局开关
2. THE Ad_System SHALL 在 ad-strategy.js 中提供插屏广告的全局开关
3. WHEN 原生模板广告开关关闭 THEN 所有页面的原生模板广告 SHALL 不显示
4. WHEN 插屏广告开关关闭 THEN 所有 TabBar_Page 的插屏广告 SHALL 不显示
5. THE Ad_System SHALL 在配置文件中记录各广告类型的状态和修改时间

### Requirement 5: 用户体验优化

**User Story:** 作为用户，我希望广告展示不会打断我的关键操作。

#### Acceptance Criteria

1. THE Interstitial_Ad SHALL 在页面显示后延迟2秒再展示
2. WHEN 用户刚进入应用 THEN Ad_System SHALL 在前5次操作内不展示任何插屏广告
3. THE Ad_System SHALL 在用户获得激励视频奖励后的有效期内隐藏所有广告
4. IF 广告加载失败连续3次 THEN Ad_System SHALL 暂停广告展示30分钟

