    # Implementation Plan: Ad Optimization

## Overview

本实现计划将广告优化方案分解为可执行的任务，按照配置层 → 管理层 → 页面层的顺序进行实现。

## Tasks

- [x] 1. 更新广告配置文件
  - [x] 1.1 在 app-config.js 中添加原生模板广告全局开关
    - 添加 `nativeTemplateAdEnabled: false` 配置项
    - 添加配置修改时间注释
    - _Requirements: 4.1, 4.5_
  - [x] 1.2 更新 ad-strategy.js 中的策略参数
    - 更新 `MIN_ACTION_COUNT` 为 5
    - 更新 `MAX_ADS_PER_SESSION` 为 5
    - 更新 `MAX_ADS_PER_DAY` 为 50
    - 更新 `NEW_USER_PROTECTION_ACTIONS` 为 20
    - 更新 `SHOW_DELAY` 为 2000
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 5.1_

- [x] 2. 更新 TabBar 页面的广告逻辑
  - [x] 2.1 更新 pages/search/index 页面
    - 在 JS 中添加 nativeAdEnabled 数据项和初始化逻辑
    - 在 WXML 中更新广告条件渲染为 `wx:if="{{ !isAdFree && nativeAdEnabled }}"`
    - _Requirements: 1.1, 1.2_
  - [x] 2.2 更新 pages/flight-calculator/index 页面
    - 在 JS 中添加 nativeAdEnabled 数据项和初始化逻辑
    - 在 WXML 中更新广告条件渲染
    - _Requirements: 1.1, 1.2_
  - [x] 2.3 更新 pages/cockpit/index 页面
    - 在 JS 中添加 nativeAdEnabled 数据项和初始化逻辑
    - 在 WXML 中更新广告条件渲染
    - _Requirements: 1.1, 1.2_
  - [x] 2.4 更新 pages/operations/index 页面
    - 在 JS 中添加 nativeAdEnabled 数据项和初始化逻辑
    - 在 WXML 中更新广告条件渲染
    - _Requirements: 1.1, 1.2_
  - [x] 2.5 更新 pages/home/index 页面
    - 在 JS 中添加 nativeAdEnabled 数据项和初始化逻辑
    - 在 WXML 中更新广告条件渲染
    - _Requirements: 1.1, 1.2_

- [x] 3. 更新其他主包页面的广告逻辑
  - [x] 3.1 更新 pages/standard-phraseology/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.2 更新 pages/communication-rules/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.3 更新 pages/communication-rules-detail/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.4 更新 pages/airline-recordings/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.5 更新 pages/recording-categories/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.6 更新 pages/recording-clips/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.7 更新 pages/audio-player/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.8 更新 pages/emergency-altitude/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 3.9 更新 pages/offline-center/index 页面
    - _Requirements: 1.1, 1.2_

- [x] 4. 更新分包页面的广告逻辑
  - [x] 4.1 更新 packageWeather/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.2 更新 packageRadiation/pages/index/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.3 更新 packageQAR/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.4 更新 packageO/dangerous-goods/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.5 更新 packageO/personal-checklist/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.6 更新 packageO/twin-engine-goaround/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.7 更新 packageO/sunrise-sunset-only/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.8 更新 packageO/sunrise-sunset/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.9 更新 packageO/snowtam-encoder/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.10 更新 packageO/rodex-decoder/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.11 更新 packageO/qualification-manager/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.12 更新 packageO/long-flight-crew-rotation/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.13 更新 packageO/incident-investigation/index 页面
    - _Requirements: 1.1, 1.2_
  - [x] 4.14 更新其他分包页面（packageA, packageB, packageC, packageD, packageDuty, packageIOSA, packageICAO, packageMedical, packageCompetence, packageAircraftPerformance, packageAircraftParameters, packageCommFailure, packageWalkaround, flight-calc-modules等）
    - _Requirements: 1.1, 1.2_

- [x] 5. Checkpoint - 验证配置和页面更新
  - 确保所有配置文件更新正确
  - 确保所有页面的广告条件渲染逻辑更新正确
  - 如有问题请告知

- [x] 6. 更新广告位ID存档文档
  - [x] 6.1 更新 广告/广告位ID存档.md 文档
    - 记录原生模板广告暂停状态
    - 更新插屏广告策略参数
    - 添加修改时间和原因说明
    - _Requirements: 4.5_

## Notes

- 所有页面的广告条件渲染逻辑统一更新为 `wx:if="{{ !isAdFree && nativeAdEnabled }}"`
- 原生模板广告代码保留，仅通过条件渲染控制显示
- 插屏广告和激励视频广告功能保持不变
- 配置开关设计便于未来恢复原生模板广告

