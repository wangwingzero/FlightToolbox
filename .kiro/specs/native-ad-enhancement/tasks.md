# Implementation Plan: Native Ad Enhancement

## Overview

本实现计划将原生模板广告增强方案分解为可执行的任务，按照配置层 → 页面层的顺序进行实现。

## Tasks

- [x] 1. 启用原生模板广告全局开关
  - [x] 1.1 在 app-config.js 中将 nativeTemplateAdEnabled 设置为 true
    - 修改 `nativeTemplateAdEnabled: true`
    - 添加配置修改时间注释
    - _Requirements: 5.4_

- [x] 2. 更新资料查询页面 (pages/search/index)
  - [x] 2.1 在 WXML 中添加横版广告
    - 在激励视频卡片 `</view>` 结束后，`categories-grid` 开始前插入横版广告
    - 使用条件 `wx:if="{{ !isAdFree && nativeAdEnabled }}"`
    - _Requirements: 1.1_
  - [x] 2.2 在 WXML 中添加竖版广告到卡片网格
    - 在 `wx:for` 循环中，当 `index === 2` 时插入竖版广告
    - 竖版广告使用 `category-card ad-card-vertical` 类名
    - _Requirements: 1.2, 1.3_
  - [x] 2.3 删除底部已有的横版广告
    - 删除 `ad-banner-container` 相关代码
    - _Requirements: 1.7_
  - [x] 2.4 在 WXSS 中添加广告样式
    - 添加 `.ad-horizontal-container` 样式
    - 添加 `.ad-card-vertical` 样式
    - _Requirements: 1.4_

- [x] 3. 更新计算工具页面 (pages/flight-calculator/index)
  - [x] 3.1 在 JS 中添加广告状态数据和初始化逻辑
    - 在文件顶部引入 appConfig 和 adFreeManager
    - 在 data 中添加 isAdFree 和 nativeAdEnabled
    - 在 onShow 中更新广告状态
    - _Requirements: 2.5, 2.6_
  - [x] 3.2 在 WXML 中添加横版广告
    - 在机场打卡卡片后，卡片网格前插入横版广告
    - _Requirements: 2.1_
  - [x] 3.3 在 WXML 中添加竖版广告到卡片网格
    - 在卡片网格第3位置插入竖版广告
    - _Requirements: 2.2, 2.3_
  - [x] 3.4 在 WXSS 中添加广告样式
    - _Requirements: 2.4_

- [x] 4. 更新通信页面 (pages/operations/index)
  - [x] 4.1 在 JS 中添加广告状态数据和初始化逻辑
    - _Requirements: 3.5, 3.6_
  - [x] 4.2 在 WXML 中添加横版广告
    - 在随机航线录音播放器卡片后插入横版广告
    - _Requirements: 3.1_
  - [x] 4.3 在 WXML 中添加竖版广告到卡片网格
    - 通信页面卡片是硬编码的，需要在第2个卡片后手动插入竖版广告
    - _Requirements: 3.2, 3.3_
  - [x] 4.4 在 WXSS 中添加广告样式
    - _Requirements: 3.4_

- [x] 5. 更新我的首页 (pages/home/index)
  - [x] 5.1 在 JS 中添加广告状态数据和初始化逻辑
    - _Requirements: 4.5, 4.6_
  - [x] 5.2 在 WXML 中添加横版广告
    - 在用户状态卡片后，资质提醒卡片前插入横版广告
    - _Requirements: 4.1_
  - [x] 5.3 在 WXML 中添加竖版广告到卡片网格
    - 我的首页卡片是硬编码的，需要在第2个卡片后手动插入竖版广告
    - _Requirements: 4.2, 4.3_
  - [x] 5.4 在 WXSS 中添加广告样式
    - _Requirements: 4.4_

- [x] 6. Checkpoint - 验证所有页面广告显示
  - 确保4个TabBar页面的广告位置正确
  - 确保驾驶舱页面没有新增广告
  - 确保广告样式与普通卡片一致
  - 如有问题请告知

- [ ] 7. 验证无广告状态联动
  - [ ] 7.1 测试观看激励视频后广告隐藏
    - 确认所有4个页面的广告都隐藏
    - _Requirements: 6.1, 6.2_
  - [ ] 7.2 测试无广告状态过期后广告恢复
    - _Requirements: 6.3_

## Notes

- 资料查询页面已有 isAdFree 和 nativeAdEnabled 逻辑，只需添加广告组件
- 计算工具、通信、我的首页需要添加广告状态数据和初始化逻辑
- 通信页面和我的首页的卡片是硬编码的，需要手动在第2个卡片后插入竖版广告
- 驾驶舱页面不做任何修改

## Code Review Fixes (2025-12-25)

### 发现并修复的问题

1. **通信页面 (operations) - isAdFree 状态未更新**
   - 问题：`isAdFree` 只在 data 中初始化为 false，但 `customOnShow` 中没有更新
   - 影响：用户观看激励视频后，广告仍然显示
   - 修复：
     - 在文件顶部添加 `const adFreeManager = require('../../utils/ad-free-manager.js');`
     - 在 `customOnShow` 中添加 `this.setData({ isAdFree: adFreeManager.isAdFreeActive() });`

2. **我的首页 (home) - isAdFree 状态未更新**
   - 问题：同上，`isAdFree` 状态没有在页面显示时更新
   - 修复：
     - 在文件顶部添加 `var adFreeManager = require('../../utils/ad-free-manager.js');`
     - 在 `customOnShow` 中添加 `this.setData({ isAdFree: adFreeManager.isAdFreeActive() });`

3. **方法名错误修复**
   - 问题：初始使用了不存在的 `adFreeManager.isAdFree()` 方法
   - 修复：改为正确的 `adFreeManager.isAdFreeActive()` 方法
