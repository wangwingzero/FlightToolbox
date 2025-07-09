# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请用中文回复

## 项目概述

FlightToolbox 是一个微信小程序，专注于航空飞行工具和航线录音功能。主要功能包括：

- **航线飞行模块**：真实机场航线录音播放和学习
- **万能查询**：ICAO代码、缩写、定义、机场信息查询
- **飞行计算**：各种航空计算器和工具
- **通信失效程序**：各地区通信失效处理差异程序
- **其他工具**：个人检查单、资质管理、事件报告等

## ⚠️ 离线设计原则

### 🚨 CRITICAL - 必须离线运行
本小程序专为航空飞行员设计，**必须能够在完全离线环境下正常运行**。

#### 为什么必须离线？
1. **飞行安全要求**：飞行员在空中执行任务时，手机必须开启飞行模式
2. **高空网络限制**：万米高空中无法使用移动网络或WiFi
3. **紧急情况处理**：通信失效等紧急情况下，飞行员需要立即访问程序和数据
4. **法规遵循**：民航法规要求飞行过程中关闭无线通信功能

#### 设计要求
- ✅ **所有核心数据必须本地存储**：ICAO代码、机场数据、通信程序等
- ✅ **音频文件必须本地缓存**：航线录音、发音示例等
- ✅ **分包预加载策略**：确保关键数据在离线时可用
- ✅ **无网络依赖功能**：计算器、检查单、程序查询等
- ❌ **禁止在线API调用**：不能依赖实时网络数据
- ❌ **禁止云端存储依赖**：用户数据必须本地存储

#### 测试验证
开发时必须验证：
1. 开启飞行模式后所有功能正常
2. 分包数据在无网络时可正常加载
3. 音频播放在离线状态下正常
4. 计算和查询功能完全离线可用

## 技术架构

### 小程序架构
- **框架**：微信小程序原生框架
- **组件库**：Vant Weapp UI组件库
- **开发语言**：TypeScript/JavaScript混合
- **编译器**：TypeScript编译器支持

### 分包结构
项目采用分包架构，按功能和地区分包：

#### 功能分包
- `packageA` - ICAO代码数据
- `packageB` - 缩写数据  
- `packageC` - 机场数据
- `packageD` - 定义数据
- `packageE` - 规范数据
- `packageF` - ACR数据
- `packageG` - 危险品数据
- `packageH` - 双发复飞数据
- `packageO` - 其他页面功能

#### 音频分包（按国家）
- `packageJapan` - 日本机场录音
- `packagePhilippines` - 菲律宾机场录音
- `packageKorean` - 韩国机场录音
- `packageSingapore` - 新加坡机场录音
- `packageThailand` - 泰国机场录音

### 音频配置架构
音频系统采用三层架构：
1. **数据层**：`miniprogram/data/regions/*.js` - 各国录音数据
2. **配置层**：`miniprogram/utils/audio-config.js` - 统一配置管理
3. **分包层**：`package*/` - 音频资源分包

## 开发命令

### 小程序开发
```bash
# 启动开发者工具
# 在微信开发者工具中打开项目根目录

# 编译检查
npm run build  # 如果有的话

# 预览和调试
# 使用微信开发者工具的预览功能
```

### 代码检查
```bash
# TypeScript类型检查
tsc --noEmit

# JavaScript语法检查
node -c miniprogram/utils/audio-config.js
```

## 重要文件说明

### 核心配置文件
- `project.config.json` - 小程序项目配置
- `miniprogram/app.json` - 小程序全局配置（页面、分包、预加载）
- `miniprogram/theme.json` - 主题配置

### 音频系统核心文件
- `miniprogram/utils/audio-config.js` - 音频配置管理器
- `miniprogram/pages/air-ground-communication/index.ts` - 主要音频播放页面
- `miniprogram/data/regions/*.js` - 各国录音数据文件

### 工具文件
- `miniprogram/utils/points-manager.js` - 积分系统管理
- `miniprogram/utils/communication-manager.js` - 通信数据管理
- `miniprogram/utils/audio-config.js` - 音频配置

## 添加新音频分包流程 ⭐ 重要

参考 `/mnt/d/FlightToolbox/docs/audio-config-architecture.md` 文档中的完整流程：

### 6个核心步骤 📋

#### 1. 创建数据文件
在 `miniprogram/data/regions/` 创建 `[country].js` 文件，包含录音数据

#### 2. 创建分包目录
创建 `package[Country]/` 目录，包含：
- `index.js`, `index.json`, `index.wxml`, `index.wxss` 
- 所有音频 mp3 文件

#### 3. 更新音频配置 
在 `miniprogram/utils/audio-config.js` 中：
- 添加数据文件 require 导入
- 添加地区配置到 `regions` 数组
- 添加机场配置到 `airports` 数组

#### 4. 更新小程序配置
在 `miniprogram/app.json` 中：
- 添加分包定义到 `subPackages`
- **重要**：分析分包大小，选择合适的预加载页面（每页<2MB）

#### 5. 更新音频播放器配置 ⚠️ 关键
在 `miniprogram/pages/audio-player/index.ts` 中：
- 添加路径映射到 `regionPathMap`
- 添加分包映射到 `subpackageMap`

#### 6. 更新预加载分包列表
如果新分包被预加载到 `air-ground-communication` 页面：
- 更新 `isPackageLoaded()` 方法中的预加载列表
- 更新 `initializePreloadedPackages()` 方法中的预加载列表

### 🚨 关键经验（俄罗斯分包案例）

#### 开发者工具异步加载限制
- 开发者工具不支持 `wx.loadSubpackage`
- 重要功能应优先配置预加载，便于开发测试
- 大分包（>1MB）建议预加载，小分包可异步加载

#### 多层配置同步要求
必须确保以下配置一致：
1. `audio-config.js` - 数据导入和地区映射
2. `app.json` - 分包定义和预加载规则  
3. `audio-player/index.ts` - 路径和分包映射
4. `air-ground-communication/index.ts` - 预加载分包列表

#### 预加载策略优化
当前最优分配 (2024年12月)：
- `air-ground-communication`: 日本(484KB) + 俄罗斯(1.3MB) = 1.78MB
- `recording-categories`: 韩国(656KB) + 新加坡(312KB) + 菲律宾(320KB) = 1.29MB  
- `recording-clips`: 泰国(968KB)

## 常见问题解决

### 语法错误修复
参考 `/mnt/d/FlightToolbox/docs/miniprogram-syntax-validation.md` 文档处理语法错误

### 音频分包优化
参考 `/mnt/d/FlightToolbox/docs/audio-subpackage-optimization.md` 文档处理分包超限问题

### 预加载限制
- 错误：`preloadRule source size exceed max limit 2MB`
- 解决：重新分配预加载规则，确保每个页面预加载总大小<2MB
- 使用异步加载替代预加载

## 代码规范

### TypeScript使用
- 主要页面使用TypeScript（`.ts`后缀）
- 工具文件可使用JavaScript（`.js`后缀）
- 保持类型安全和代码提示

### 命名约定
- 分包命名：`package[Country]`（首字母大写）
- 数据文件：`[country].js`（小写）
- 地区ID：小写英文（如：`singapore`）
- 音频文件：`[Airline-Flight]_[Action-Description].mp3`

### 文件组织
- 按功能模块组织页面
- 工具类放在 `utils/` 目录
- 数据文件放在 `data/` 目录
- 组件放在 `components/` 目录

## 部署和发布

### 发布前检查 ✅
1. **配置一致性**：确保 6 个核心步骤的所有配置同步
2. **分包大小检查**：每个预加载页面 < 2MB
3. **音频路径验证**：所有音频文件路径正确
4. **功能测试**：开发者工具和真机测试音频播放
5. **异步加载测试**：验证非预加载分包的动态加载
6. **语法检查**：`node -c` 验证所有配置文件

### 版本管理
- 使用微信开发者工具的版本管理功能
- 保持代码和配置同步
- 注意小程序审核要求

# 参考文档
在处理相关问题时，请参考以下文档：

## 音频配置架构相关
- 音频分包配置和管理: `/mnt/d/FlightToolbox/docs/audio-config-architecture.md`
- 音频分包优化策略: `/mnt/d/FlightToolbox/docs/audio-subpackage-optimization.md`

## 语法错误修复相关
- 微信小程序语法验证与错误修复: `/mnt/d/FlightToolbox/docs/miniprogram-syntax-validation.md`
  - 适用于解决"Unexpected token: punc (.)"等语法错误
  - 包含ES6+语法兼容性处理方案
  - 提供系统性的修复流程和预防措施

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.