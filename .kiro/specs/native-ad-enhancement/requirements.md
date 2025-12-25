# Requirements Document

## Introduction

本需求文档描述了 FlightToolbox 小程序原生模板广告增强方案。目标是在4个TabBar页面（资料查询、计算工具、通信、我的首页）增加原生模板广告，提升广告曝光和收益。驾驶舱页面不需要增加广告。

## Glossary

- **Ad_System**: 广告管理系统，负责管理所有广告类型的展示逻辑
- **Native_Template_Ad**: 原生模板广告，包括横幅广告、竖版广告
- **Horizontal_Ad**: 横版广告，放置在页面顶部特殊卡片下方
- **Vertical_Ad**: 竖版广告（卡片式），插入到卡片网格的第3个位置，样式与普通卡片一致
- **TabBar_Page**: 底部导航栏页面，共5个：资料查询、计算工具、驾驶舱、通信、我的首页
- **Card_Grid**: 卡片网格，页面中用于展示功能卡片的网格布局
- **isAdFree**: 无广告状态标识，用户观看激励视频后获得1小时无广告奖励
- **nativeAdEnabled**: 原生模板广告全局开关

## Requirements

### Requirement 1: 资料查询页面广告增强

**User Story:** 作为开发者，我希望在资料查询页面增加原生模板广告，以提升广告曝光和收益。

#### Acceptance Criteria

1. WHEN 用户访问资料查询页面 THEN Ad_System SHALL 在激励视频卡片下方显示横版广告
2. WHEN 用户访问资料查询页面 THEN Ad_System SHALL 在卡片网格第3个位置插入竖版广告
3. WHEN 竖版广告插入后 THEN Card_Grid SHALL 自动将原第3个卡片后移至第4位置
4. THE 竖版广告 SHALL 与普通卡片保持一致的外观样式（圆角、阴影、尺寸）
5. WHEN 用户处于无广告状态 THEN Ad_System SHALL 隐藏横版广告和竖版广告
6. WHEN 广告隐藏后 THEN Card_Grid SHALL 自动回流填充，无空白区域
7. THE Ad_System SHALL 删除资料查询页面底部已有的横版广告（避免广告过多）

### Requirement 2: 计算工具页面广告增强

**User Story:** 作为开发者，我希望在计算工具页面增加原生模板广告，以提升广告曝光和收益。

#### Acceptance Criteria

1. WHEN 用户访问计算工具页面 THEN Ad_System SHALL 在机场打卡卡片下方显示横版广告
2. WHEN 用户访问计算工具页面 THEN Ad_System SHALL 在卡片网格第3个位置插入竖版广告
3. WHEN 竖版广告插入后 THEN Card_Grid SHALL 自动将原第3个卡片后移至第4位置
4. THE 竖版广告 SHALL 与普通卡片保持一致的外观样式
5. WHEN 用户处于无广告状态 THEN Ad_System SHALL 隐藏横版广告和竖版广告
6. WHEN 广告隐藏后 THEN Card_Grid SHALL 自动回流填充，无空白区域

### Requirement 3: 通信页面广告增强

**User Story:** 作为开发者，我希望在通信页面增加原生模板广告，以提升广告曝光和收益。

#### Acceptance Criteria

1. WHEN 用户访问通信页面 THEN Ad_System SHALL 在随机航线录音播放器卡片下方显示横版广告
2. WHEN 用户访问通信页面 THEN Ad_System SHALL 在卡片网格第3个位置插入竖版广告
3. WHEN 竖版广告插入后 THEN Card_Grid SHALL 自动将原第3个卡片后移至第4位置
4. THE 竖版广告 SHALL 与普通卡片保持一致的外观样式
5. WHEN 用户处于无广告状态 THEN Ad_System SHALL 隐藏横版广告和竖版广告
6. WHEN 广告隐藏后 THEN Card_Grid SHALL 自动回流填充，无空白区域

### Requirement 4: 我的首页广告增强

**User Story:** 作为开发者，我希望在我的首页增加原生模板广告，以提升广告曝光和收益。

#### Acceptance Criteria

1. WHEN 用户访问我的首页 THEN Ad_System SHALL 在用户状态卡片下方显示横版广告
2. WHEN 用户访问我的首页 THEN Ad_System SHALL 在卡片网格第3个位置插入竖版广告
3. WHEN 竖版广告插入后 THEN Card_Grid SHALL 自动将原第3个卡片后移至第4位置
4. THE 竖版广告 SHALL 与普通卡片保持一致的外观样式
5. WHEN 用户处于无广告状态 THEN Ad_System SHALL 隐藏横版广告和竖版广告
6. WHEN 广告隐藏后 THEN Card_Grid SHALL 自动回流填充，无空白区域

### Requirement 5: 广告配置管理

**User Story:** 作为开发者，我希望通过统一的配置管理广告显示状态。

#### Acceptance Criteria

1. THE Ad_System SHALL 使用现有广告位ID（横版: adunit-3a1bf3800fa937a2, 竖版: adunit-d7a3b71f5ce0afca）
2. THE Ad_System SHALL 通过 nativeAdEnabled 全局开关控制广告显示
3. WHEN nativeAdEnabled 为 false THEN 所有页面的原生模板广告 SHALL 不显示
4. THE Ad_System SHALL 将 nativeAdEnabled 设置为 true 以启用广告

### Requirement 6: 无广告状态联动

**User Story:** 作为用户，我希望观看激励视频后获得的无广告奖励能够隐藏所有广告。

#### Acceptance Criteria

1. WHEN 用户观看完整激励视频广告 THEN Ad_System SHALL 授予用户1小时无广告奖励
2. WHEN 用户处于无广告状态 THEN 所有4个TabBar页面的横版广告和竖版广告 SHALL 隐藏
3. WHEN 无广告状态过期 THEN Ad_System SHALL 在用户下次进入页面时恢复广告显示

### Requirement 7: 驾驶舱页面排除

**User Story:** 作为用户，我希望驾驶舱页面保持简洁，不显示广告。

#### Acceptance Criteria

1. THE 驾驶舱页面 SHALL 不增加任何新的广告位
2. THE 驾驶舱页面 SHALL 保持现有功能不变
